
import numpy as np
from utils import measure_distance

class PassAndShotEstimator:
    def __init__(
        self,
        short_pass_thresh: float = 15.0,
        long_pass_thresh:  float = 30.0,
        wide_area_frac:    float = 0.2,
        speed_thresh:      float = 15.0
    ):
        self.short_t   = short_pass_thresh
        self.long_t    = long_pass_thresh
        self.wide_frac = wide_area_frac
        self.speed_t   = speed_thresh

    def _build_control_seq(self, tracks):
        seq = []
        for f, players in enumerate(tracks["players"]):
            for pid, info in players.items():
                if not info.get("has_ball", False):
                    continue
                pos = info.get("position_transformed") or info.get("position")
                if not pos or len(pos) < 2:
                    continue
                seq.append({"frame": f, "pid": pid, "team": info.get("team_id"), "pos": pos})
        # collapse consecutive same‐player
        compressed = []
        for e in seq:
            if not compressed or compressed[-1]["pid"]!=e["pid"]:
                compressed.append(e)
        return compressed

    def detect_passes(self, control_seq):
        events = []
        for a, b in zip(control_seq, control_seq[1:]):
            if a["team"]!=b["team"]:
                continue
            pa = np.array(a["pos"],dtype=float)
            pb = np.array(b["pos"],dtype=float)
            d  = measure_distance(pa, pb)
            vec= pb-pa
            events.append({
                "from":     a["pid"],
                "to":       b["pid"],
                "team":     a["team"],
                "distance": d,
                "vec":      vec,
                "start_pos": a["pos"],
                "end_pos":   b["pos"]
            })
        return events

    def classify_passes(self, passes, field_dims=(100.0,64.0)):
        W,H = field_dims
        stats = {"total_passes":len(passes),"short_passes":0,"long_passes":0,"crosses":0,"back_passes":0}
        success = len(passes)
        for p in passes:
            d = p["distance"]
            if   d<=self.short_t: stats["short_passes"]+=1
            elif d>=self.long_t:  stats["long_passes"]+=1
            x0,y0 = p["start_pos"]; x1,_=p["end_pos"]
            if (y0<=self.wide_frac*H or y0>=(1-self.wide_frac)*H) and (x1<=16.5 or x1>=W-16.5):
                stats["crosses"]+=1
            if p["vec"][0]<0:
                stats["back_passes"]+=1
        stats["pass_accuracy"] = round(success/stats["total_passes"]*100,2) if stats["total_passes"]>0 else 0.0
        return stats

    def detect_shots(self, ball_tracks):
        shots = 0
        for frame in ball_tracks:
            b = frame.get(1,{})
            if b.get("speed",0)>=self.speed_t:
                shots+=1
        return {"total_shots":shots}

    def compute_all(self, tracks):
        seq   = self._build_control_seq(tracks)
        passes= self.detect_passes(seq)
        ps    = self.classify_passes(passes)
        ss    = self.detect_shots(tracks["ball"])
        return {**ps,**ss}