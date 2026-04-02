"""
utils/bankers_algorithm.py
Banker's Algorithm for deadlock detection with multiple-instance resources.
Also provides safe sequence computation.
"""

from typing import Dict, List, Tuple, Optional


class BankersAlgorithm:
    """
    Implements Banker's Algorithm for multi-instance resource deadlock detection.

    Inputs (all indexed):
      processes   : list of process IDs  ["p0", "p1", ...]
      resources   : list of resource IDs ["r0", "r1", ...]
      max_matrix  : {pid: {rid: int}}  — max demand per process per resource
      alloc_matrix: {pid: {rid: int}}  — current allocation
      available   : {rid: int}         — currently available instances

    Computes:
      need_matrix : max - allocation
      safe_sequence (if system is safe)
      deadlocked_processes (if not safe)
    """

    def __init__(
        self,
        processes:    List[str],
        resources:    List[str],
        max_matrix:   Dict[str, Dict[str, int]],
        alloc_matrix: Dict[str, Dict[str, int]],
        available:    Dict[str, int],
    ):
        self.processes    = processes
        self.resources    = resources
        self.max_matrix   = max_matrix
        self.alloc_matrix = alloc_matrix
        self.available    = dict(available)

        # Compute Need = Max - Allocation
        self.need_matrix: Dict[str, Dict[str, int]] = {}
        for pid in processes:
            self.need_matrix[pid] = {}
            for rid in resources:
                m = max_matrix.get(pid, {}).get(rid, 0)
                a = alloc_matrix.get(pid, {}).get(rid, 0)
                self.need_matrix[pid][rid] = max(0, m - a)

    # ------------------------------------------------------------------ #

    def run(self) -> dict:
        """
        Run the safety algorithm.
        Returns a result dict with all matrices and deadlock info.
        """
        work   = dict(self.available)
        finish = {pid: False for pid in self.processes}
        safe_sequence = []

        # Safety algorithm loop
        changed = True
        while changed:
            changed = False
            for pid in self.processes:
                if finish[pid]:
                    continue
                need = self.need_matrix[pid]
                # Can we satisfy this process's need?
                if all(need.get(rid, 0) <= work.get(rid, 0) for rid in self.resources):
                    # Yes — simulate completion
                    for rid in self.resources:
                        work[rid] = work.get(rid, 0) + self.alloc_matrix.get(pid, {}).get(rid, 0)
                    finish[pid] = True
                    safe_sequence.append(pid)
                    changed = True

        is_safe = all(finish.values())
        deadlocked = [pid for pid, f in finish.items() if not f]

        # Build dependency explanation for deadlocked processes
        dependency_info = self._build_dependency_info(deadlocked) if deadlocked else []

        return {
            "is_safe":          is_safe,
            "safe_sequence":    safe_sequence,
            "deadlocked":       deadlocked,
            "finish":           finish,
            "need_matrix":      self.need_matrix,
            "alloc_matrix":     self.alloc_matrix,
            "max_matrix":       self.max_matrix,
            "available":        self.available,
            "dependency_info":  dependency_info,
        }

    def _build_dependency_info(self, deadlocked: List[str]) -> List[dict]:
        """
        For each deadlocked process, explain which resource it needs
        but cannot get (because available < need).
        """
        info = []
        deadlocked_set = set(deadlocked)

        for pid in deadlocked:
            blocking = []
            for rid in self.resources:
                needed    = self.need_matrix.get(pid, {}).get(rid, 0)
                avail     = self.available.get(rid, 0)
                if needed > 0 and avail < needed:
                    # Who holds this resource?
                    holders = [
                        other for other in self.processes
                        if self.alloc_matrix.get(other, {}).get(rid, 0) > 0
                        and other != pid
                    ]
                    blocking.append({
                        "resource":  rid,
                        "needed":    needed,
                        "available": avail,
                        "held_by":   holders,
                    })
            info.append({
                "process":  pid,
                "blocking": blocking,
            })
        return info


def run_bankers(
    processes:    List[str],
    resources:    List[str],
    max_matrix:   Dict[str, Dict[str, int]],
    alloc_matrix: Dict[str, Dict[str, int]],
    available:    Dict[str, int],
) -> dict:
    """Convenience wrapper."""
    ba = BankersAlgorithm(processes, resources, max_matrix, alloc_matrix, available)
    return ba.run()