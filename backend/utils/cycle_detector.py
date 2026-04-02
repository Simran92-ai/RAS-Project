# """
# utils/cycle_detector.py
# DFS-based cycle detection for Resource Allocation Graph

# In a RAG:
# - Process nodes request resources (Process -> Resource = request edge)
# - Resource nodes are allocated to processes (Resource -> Process = allocation edge)
# - A deadlock exists if there's a cycle in the graph
# """

# from typing import Dict, List, Tuple, Optional, Set


# class CycleDetector:
#     """
#     Implements DFS-based cycle detection on the Resource Allocation Graph.
    
#     The graph is treated as a directed graph where:
#       - Request edge: process -> resource
#       - Allocation edge: resource -> process
    
#     A cycle in this directed graph implies a circular wait, which is
#     a necessary condition for deadlock.
#     """

#     def __init__(self, adjacency: Dict[str, List[str]]):
#         """
#         adjacency: dict mapping each node id to list of neighbor ids
#         """
#         self.adjacency = adjacency
#         self.visited: Set[str] = set()
#         self.rec_stack: Set[str] = set()        # nodes in current DFS path
#         self.parent: Dict[str, Optional[str]] = {}
#         self.traversal_steps: List[dict] = []
#         self.cycle_path: List[str] = []
#         self.step_counter = 0

#     def detect_cycle(self) -> Tuple[bool, List[str], List[dict]]:
#         """
#         Run DFS cycle detection over all nodes.
#         Returns:
#           (has_cycle, cycle_path, traversal_steps)
#         """
#         all_nodes = set(self.adjacency.keys())
#         # Also include nodes that appear only as targets
#         for neighbors in self.adjacency.values():
#             all_nodes.update(neighbors)

#         for node in all_nodes:
#             if node not in self.adjacency:
#                 self.adjacency[node] = []

#         for node in all_nodes:
#             if node not in self.visited:
#                 self._log_step("start", node, f"Starting DFS from node: {node}")
#                 found, path = self._dfs(node)
#                 if found:
#                     return True, path, self.traversal_steps

#         return False, [], self.traversal_steps

#     def _dfs(self, node: str) -> Tuple[bool, List[str]]:
#         """
#         DFS traversal from a given node.
#         Returns (cycle_found, cycle_path)
#         """
#         self.visited.add(node)
#         self.rec_stack.add(node)
#         self._log_step("visit", node, f"Visiting node: {node}", list(self.rec_stack))

#         for neighbor in self.adjacency.get(node, []):
#             self._log_step(
#                 "explore", neighbor,
#                 f"Exploring edge {node} → {neighbor}",
#                 list(self.rec_stack)
#             )

#             if neighbor not in self.visited:
#                 self.parent[neighbor] = node
#                 found, path = self._dfs(neighbor)
#                 if found:
#                     return True, path

#             elif neighbor in self.rec_stack:
#                 # Cycle found — reconstruct the cycle path
#                 self._log_step(
#                     "cycle", neighbor,
#                     f"🔴 Cycle detected! Back edge: {node} → {neighbor}",
#                     list(self.rec_stack)
#                 )
#                 cycle = self._reconstruct_cycle(node, neighbor)
#                 return True, cycle

#         self.rec_stack.discard(node)
#         self._log_step("backtrack", node, f"Backtracking from: {node}", list(self.rec_stack))
#         return False, []

#     def _reconstruct_cycle(self, current: str, cycle_start: str) -> List[str]:
#         """
#         Walk back through rec_stack to reconstruct the cycle path.
#         """
#         stack_list = list(self.rec_stack)
#         # Find index of cycle_start in current DFS path
#         try:
#             idx = stack_list.index(cycle_start)
#             cycle = stack_list[idx:] + [current, cycle_start]
#         except ValueError:
#             # Fallback: parent chain reconstruction
#             cycle = [current, cycle_start]
#             node = current
#             visited_in_trace = {current}
#             while node in self.parent and self.parent[node] != cycle_start:
#                 node = self.parent[node]
#                 if node in visited_in_trace:
#                     break
#                 cycle.insert(0, node)
#                 visited_in_trace.add(node)
#             cycle.insert(0, cycle_start)

#         self.cycle_path = cycle
#         return cycle

#     def _log_step(
#         self,
#         step_type: str,
#         node: str,
#         message: str,
#         stack: Optional[List[str]] = None
#     ):
#         """Record a traversal step for step-by-step visualization"""
#         self.step_counter += 1
#         self.traversal_steps.append({
#             "step": self.step_counter,
#             "type": step_type,       # start | visit | explore | cycle | backtrack
#             "node": node,
#             "message": message,
#             "current_stack": stack or []
#         })



# def detect_deadlock(processes, resources, requests, allocations):
#     """
#     Converts RAG input into adjacency list and runs cycle detection
#     """

#     adjacency = {}

#     # Initialize nodes
#     for p in processes:
#         adjacency[p["id"]] = []

#     for r in resources:
#         adjacency[r["id"]] = []

#     # Process → Resource (request)
#     for req in requests:
#         adjacency[req["process"]].append(req["resource"])

#     # Resource → Process (allocation)
#     for alloc in allocations:
#         adjacency[alloc["resource"]].append(alloc["process"])

#     # Run DFS cycle detection
#     detector = CycleDetector(adjacency)
#     has_cycle, cycle_path, steps = detector.detect_cycle()

#     return has_cycle, cycle_path, steps, adjacency



"""
utils/cycle_detector.py  —  FIXED VERSION

No logic bugs were found in the DFS itself.
Cleanup: removed duplicate/dead code at the bottom.
The detect_deadlock() helper function at the bottom is the
public API used by graph_builder.py.
"""

from typing import Dict, List, Tuple, Optional, Set


class CycleDetector:
    """
    DFS-based cycle detection for a directed Resource Allocation Graph.

    Request edge : process → resource
    Allocation edge: resource → process

    A cycle in this directed graph = circular wait = deadlock.
    """

    def __init__(self, adjacency: Dict[str, List[str]]):
        self.adjacency = adjacency
        self.visited:    Set[str] = set()
        self.rec_stack:  Set[str] = set()   # nodes on the current DFS path
        self.parent:     Dict[str, Optional[str]] = {}
        self.traversal_steps: List[dict] = []
        self.cycle_path: List[str] = []
        self.step_counter = 0

    def detect_cycle(self) -> Tuple[bool, List[str], List[dict]]:
        """
        Run DFS over all nodes.
        Returns (has_cycle, cycle_path_ids, traversal_steps).
        """
        all_nodes = set(self.adjacency.keys())
        for neighbors in self.adjacency.values():
            all_nodes.update(neighbors)

        # Ensure every node has an entry (even leaf nodes)
        for node in all_nodes:
            if node not in self.adjacency:
                self.adjacency[node] = []

        for node in all_nodes:
            if node not in self.visited:
                self._log("start", node, f"Starting DFS from: {node}")
                found, path = self._dfs(node)
                if found:
                    return True, path, self.traversal_steps

        return False, [], self.traversal_steps

    # ── Private helpers ───────────────────────────────────────────

    def _dfs(self, node: str) -> Tuple[bool, List[str]]:
        self.visited.add(node)
        self.rec_stack.add(node)
        self._log("visit", node, f"Visiting: {node}", list(self.rec_stack))

        for neighbor in self.adjacency.get(node, []):
            self._log("explore", neighbor,
                      f"Edge {node} → {neighbor}", list(self.rec_stack))

            if neighbor not in self.visited:
                self.parent[neighbor] = node
                found, path = self._dfs(neighbor)
                if found:
                    return True, path

            elif neighbor in self.rec_stack:
                self._log("cycle", neighbor,
                          f"🔴 Back edge: {node} → {neighbor}",
                          list(self.rec_stack))
                return True, self._reconstruct_cycle(node, neighbor)

        self.rec_stack.discard(node)
        self._log("backtrack", node, f"Backtrack from: {node}",
                  list(self.rec_stack))
        return False, []

    def _reconstruct_cycle(self, current: str, cycle_start: str) -> List[str]:
        stack_list = list(self.rec_stack)
        try:
            idx = stack_list.index(cycle_start)
            cycle = stack_list[idx:] + [current, cycle_start]
        except ValueError:
            cycle = [cycle_start, current, cycle_start]
            node = current
            seen = {current}
            while node in self.parent and self.parent[node] != cycle_start:
                node = self.parent[node]
                if node in seen:
                    break
                cycle.insert(1, node)
                seen.add(node)
        self.cycle_path = cycle
        return cycle

    def _log(self, step_type: str, node: str, message: str,
             stack: Optional[List[str]] = None):
        self.step_counter += 1
        self.traversal_steps.append({
            "step":          self.step_counter,
            "type":          step_type,
            "node":          node,
            "message":       message,
            "current_stack": stack or []
        })


# ── Public helper used by graph_builder.py ────────────────────────

def detect_deadlock(
    processes:   List[dict],
    resources:   List[dict],
    requests:    List[dict],
    allocations: List[dict],
) -> Tuple[bool, List[str], List[dict], Dict[str, List[str]]]:
    """
    Convert RAG input to adjacency list and run cycle detection.

    Returns (has_cycle, cycle_path_ids, traversal_steps, adjacency_dict)
    """
    adjacency: Dict[str, List[str]] = {}

    for p in processes:
        adjacency[p["id"]] = []
    for r in resources:
        adjacency[r["id"]] = []

    # Request: process → resource
    for req in requests:
        adjacency[req["process"]].append(req["resource"])

    # Allocation: resource → process
    for alloc in allocations:
        adjacency[alloc["resource"]].append(alloc["process"])

    detector = CycleDetector(adjacency)
    has_cycle, cycle_path, steps = detector.detect_cycle()

    return has_cycle, cycle_path, steps, adjacency