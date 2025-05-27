import argparse
from utils import read_video, save_video
from trackers import Tracker
import cv2
import os
import json
import numpy as np
from team_assigner import TeamAssigner
from player_ball_assigner import PlayerBallAssigner
from camera_movement_estimator import CameraMovementEstimator
from view_transformer import ViewTransformer
from speed_and_distance_estimator import SpeedAndDistance_Estimator
from pass_and_shot_estimator import PassAndShotEstimator

parser = argparse.ArgumentParser()
parser.add_argument('--team1', type=str, default='Team 1')
parser.add_argument('--team2', type=str, default='Team 2')
args = parser.parse_args()

team1_name = args.team1
team2_name = args.team2

def annotate_team_names_on_players(frames, tracks):
    for frame_num, frame in enumerate(frames):
        for player_id, track in tracks['players'][frame_num].items():
            team_name = track.get('team', 'Unknown')
            bbox = track['bbox']
            x, y = int(bbox[0]), int(bbox[1])
            cv2.putText(frame, team_name, (x, y - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
    return frames

def main():
    video_frames = read_video('input_videos/input_vid.mp4')

    model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
    tracker = Tracker(model_path)

    tracks = tracker.get_object_tracks(video_frames,
                                       read_from_stub=True,
                                       stub_path='stubs/track_stubs.pkl')
    tracker.add_position_to_tracks(tracks)

    camera_movement_estimator = CameraMovementEstimator(video_frames[0])
    camera_movement_per_frame = camera_movement_estimator.get_camera_movement(video_frames,
                                                                               read_from_stub=True,
                                                                               stub_path='stubs/camera_movement_stub.pkl')
    camera_movement_estimator.add_adjust_positions_to_tracks(tracks, camera_movement_per_frame)

    view_transformer = ViewTransformer()
    view_transformer.add_transformed_position_to_tracks(tracks)

    tracks["ball"] = tracker.interpolate_ball_positions(tracks["ball"])

    speed_and_distance_estimator = SpeedAndDistance_Estimator()
    speed_and_distance_estimator.add_speed_and_distance_to_tracks(tracks)

    team_assigner = TeamAssigner(team_names=(team1_name, team2_name))
    team_assigner.assign_team_color(video_frames[0], tracks['players'][0])

    for frame_num, player_track in enumerate(tracks['players']):
        for player_id, track in player_track.items():
            team_info = team_assigner.get_player_team(video_frames[frame_num],
                                                      track['bbox'],
                                                      player_id)
            tracks['players'][frame_num][player_id]['team'] = team_info['name']
            tracks['players'][frame_num][player_id]['team_color'] = team_assigner.team_colors[team_info['id']]

    player_assigner = PlayerBallAssigner()
    team_ball_control = []
    for frame_num, player_track in enumerate(tracks['players']):
        ball_bbox = tracks['ball'][frame_num][1]['bbox']
        assigned_player = player_assigner.assign_ball_to_player(player_track, ball_bbox)

        if assigned_player != -1:
            tracks['players'][frame_num][assigned_player]['has_ball'] = True
            team_ball_control.append(tracks['players'][frame_num][assigned_player]['team'])
        else:
        # Default to neutral or unknown team if no previous control exists
            if len(team_ball_control) > 0:
                team_ball_control.append(team_ball_control[-1])
            else:
                team_ball_control.append("Unknown")
    team_ball_control = np.array(team_ball_control)

    # Calculate overall possession
    team_1_frames = np.count_nonzero(team_ball_control == team1_name)
    team_2_frames = np.count_nonzero(team_ball_control == team2_name)
    total_frames = team_1_frames + team_2_frames

    if total_frames == 0:
        team_1_percent = 50.0
        team_2_percent = 50.0
    else:
        team_1_percent = round((team_1_frames / total_frames) * 100, 2)
        team_2_percent = round((team_2_frames / total_frames) * 100, 2)

    possession_data = {
        team1_name: team_1_percent,
        team2_name: team_2_percent
    }

    pass_estimator = PassAndShotEstimator()
    pass_stats = pass_estimator.compute_all(tracks)

    # Compute player speed & distance stats
    player_stats = {}
    for frame_num, frame_players in enumerate(tracks["players"]):
        for player_id, info in frame_players.items():
            team = info.get("team")
            speed = info.get("speed", 0.0)
            distance = info.get("distance", 0.0)
            if team not in player_stats:
                player_stats[team] = {}
            if player_id not in player_stats[team]:
                player_stats[team][player_id] = {
                    "distance": [],
                    "speed": [],
                    "max_speed": 0.0,
            }
            player_stats[team][player_id]["distance"].append(distance)
            player_stats[team][player_id]["speed"].append(speed)
            player_stats[team][player_id]["max_speed"] = max(
                player_stats[team][player_id]["max_speed"], speed)
            
    # Build JSON for team stats
    match_stats = {
        "team1": {
            "name": team1_name,
            "ballPossession": team_1_percent,
            "goals": 0,  # Replace with actual goal detection if available
            "totalShots": pass_stats["total_shots"],
            "passes": {
                "totalPasses": pass_stats["total_passes"],
                "passAccuracy": pass_stats["pass_accuracy"],
                "crosses": pass_stats["crosses"],
                "longPasses": pass_stats["long_passes"],
                "backPasses": pass_stats["back_passes"]
            },
            "players": []
        },
        "team2": {
            "name": team2_name,
            "ballPossession": team_2_percent,
            "goals": 0,
            "totalShots": pass_stats["total_shots"],
            "passes": {
                "totalPasses": pass_stats["total_passes"],
                "passAccuracy": pass_stats["pass_accuracy"],
                "crosses": pass_stats["crosses"],
                "longPasses": pass_stats["long_passes"],
                "backPasses": pass_stats["back_passes"]
            },
            "players": []
        }
    }

    for team, players in player_stats.items():
        team_key = "team1" if team == team1_name else "team2"
        for player_id, data in players.items():
            dists = data["distance"]
            speeds = data["speed"]
            match_stats[team_key]["players"].append({
                "name": f"Player {player_id}",
                "position": "N/A",
                "longestDistance": round(max(dists), 2) if dists else 0.0,
                "avgDistance": round(sum(dists)/len(dists), 2) if dists else 0.0,
                "highestSpeed": round(data["max_speed"], 2),
                "avgSpeed": round(sum(speeds)/len(speeds), 2) if speeds else 0.0
        })
        
    with open("output_videos/stats.json", "w") as f:
        json.dump(match_stats, f, indent=2)


    output_video_frames = tracker.draw_annotations(video_frames, tracks, team_ball_control)
    output_video_frames = camera_movement_estimator.draw_camera_movement(output_video_frames, camera_movement_per_frame)

    # DO NOT draw speed/distance here (just calculate them)
    # speed_and_distance_estimator.draw_speed_and_distance(output_video_frames, tracks)

    # Add team name annotation instead
    output_video_frames = annotate_team_names_on_players(output_video_frames, tracks)

    save_video(output_video_frames, 'output_videos/output_vid.mp4')

if __name__ == '__main__':
    main()