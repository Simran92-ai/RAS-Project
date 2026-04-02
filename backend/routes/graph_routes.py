# from flask import Blueprint, request, jsonify
# from utils.graph_builder import build_graph

# graph_bp = Blueprint("graph_bp", __name__)


# @graph_bp.route("/api/health", methods=["GET"])
# def health():
#     return jsonify({"status": "OK"})


# @graph_bp.route("/api/sample", methods=["GET"])
# def sample():
#     return jsonify({
#         "processes": [
#             {"id": "p0", "label": "Process A"},
#             {"id": "p1", "label": "Process B"}
#         ],
#         "resources": [
#             {"id": "r0", "label": "Resource X"},
#             {"id": "r1", "label": "Resource Y"}
#         ],
#         "requests": [
#             {"process": "p0", "resource": "r0"},
#             {"process": "p1", "resource": "r1"}
#         ],
#         "allocations": [
#             {"resource": "r0", "process": "p1"},
#             {"resource": "r1", "process": "p0"}
#         ]
#     })


# @graph_bp.route("/api/analyze", methods=["POST"])
# def analyze():
#     data = request.get_json()

#     processes = data.get("processes", [])
#     resources = data.get("resources", [])
#     requests = data.get("requests", [])
#     allocations = data.get("allocations", [])

#     nodes, edges, adjacency, deadlock = build_graph(
#         processes, resources, requests, allocations
#     )

#     return jsonify({
#         "nodes": nodes,
#         "edges": edges,
#         "deadlock_detected": deadlock,
#         "adjacency_list": adjacency,
#         "explanation": "🔴 Deadlock detected!" if deadlock else "🟢 No deadlock"
#     })

# from flask import Blueprint, request, jsonify

# graph_bp = Blueprint('graph', __name__)

# # Health check route
# @graph_bp.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "OK", "message": "Backend is healthy 🚀"})

# # Main analyze route
# @graph_bp.route("/analyze", methods=["POST"])
# def analyze():
#     """
#     Expects JSON with keys:
#     - processes: ["P1", "P2", ...]
#     - resources: ["R1", "R2", ...]
#     - requests: [{"process": "P1", "resource": "R2"}, ...]
#     - allocations: [{"process": "P1", "resource": "R1"}, ...]
#     """
#     data = request.get_json()

#     processes = data.get("processes", [])
#     resources = data.get("resources", [])
#     requests = data.get("requests", [])
#     allocations = data.get("allocations", [])

#     nodes = []
#     edges = []

#     # Add process nodes
#     for p in processes:
#         nodes.append({"id": p, "label": p, "color": "lightblue"})

#     # Add resource nodes
#     for r in resources:
#         nodes.append({"id": r, "label": r, "color": "orange"})

#     # Add request edges (process -> resource)
#     for req in requests:
#         edges.append({"from": req["process"], "to": req["resource"], "arrows": "to"})

#     # Add allocation edges (resource -> process)
#     for alloc in allocations:
#         edges.append({"from": alloc["resource"], "to": alloc["process"], "arrows": "to"})

#     # For now, deadlock detection is dummy
#     deadlock_detected = False
#     explanation = "🟢 No deadlock (basic version)"

#     return jsonify({
#         "nodes": nodes,
#         "edges": edges,
#         "deadlock_detected": deadlock_detected,
#         "explanation": explanation
#     })
# # ===== Add this at the end =====
# @graph_bp.route("/sample", methods=["GET"])
# def sample():
#     return {
#         "message": "Hello from sample!",
#         "nodes": [
#             {"id": "P1", "label": "P1", "color": "lightblue"},
#             {"id": "R1", "label": "R1", "color": "orange"}
#         ],
#         "edges": [
#             {"from": "P1", "to": "R1", "arrows": "to"}
#         ]
#     }


# """
# routes/graph_routes.py  —  FIXED VERSION
# Flask Blueprint for all graph-related API endpoints.

# Bugs fixed:
#   1. /analyze now calls cycle_detector properly instead of always returning deadlock=False
#   2. /analyze returns correct field names (source/target not from/to)
#   3. /analyze includes all required fields: cycle_path, cycle_edges, traversal_steps, adjacency_list
#   4. /sample returns jsonify() not a raw dict (caused TypeError in Flask 3.x)
#   5. /sample returns correct {id, label, type} node format matching frontend expectations
#   6. Input validation handles the {id, label} object format sent by the React frontend
# """

# from flask import Blueprint, request, jsonify
# from utils.graph_builder import build_graph

# graph_bp = Blueprint('graph', __name__)


# # ------------------------------------------------------------------ #
# #  Health check                                                        #
# # ------------------------------------------------------------------ #
# @graph_bp.route("/health", methods=["GET"])
# def health():
#     return jsonify({"status": "OK", "message": "RAG Backend is running 🚀"})


# # ------------------------------------------------------------------ #
# #  Main analyze endpoint                                               #
# # ------------------------------------------------------------------ #
# @graph_bp.route("/analyze", methods=["POST"])
# def analyze():
#     """
#     POST /api/analyze
#     Expects JSON body:
#     {
#       "processes":   [{"id": "p0", "label": "Process A"}, ...],
#       "resources":   [{"id": "r0", "label": "Resource X"}, ...],
#       "requests":    [{"process": "p0", "resource": "r0"}, ...],
#       "allocations": [{"resource": "r0", "process": "p1"}, ...]
#     }
#     """
#     data = request.get_json(force=True, silent=True)

#     # ── Input validation ──────────────────────────────────────────
#     if not data:
#         return jsonify({"error": "Request body is empty or not valid JSON."}), 400

#     processes   = data.get("processes",   [])
#     resources   = data.get("resources",   [])
#     requests_   = data.get("requests",    [])
#     allocations = data.get("allocations", [])

#     if not isinstance(processes, list):
#         return jsonify({"error": "'processes' must be a list."}), 400
#     if not isinstance(resources, list):
#         return jsonify({"error": "'resources' must be a list."}), 400
#     if not isinstance(requests_, list):
#         return jsonify({"error": "'requests' must be a list."}), 400
#     if not isinstance(allocations, list):
#         return jsonify({"error": "'allocations' must be a list."}), 400

#     if len(processes) == 0 and len(resources) == 0:
#         return jsonify({"error": "At least one process or resource is required."}), 400

#     if requests_ == [] and allocations == []:
#         return jsonify({"error": "Add at least one edge (request or allocation)."}), 400

#     if len(processes) > 20:
#         return jsonify({"error": "Maximum 20 processes supported."}), 400

#     if len(resources) > 20:
#         return jsonify({"error": "Maximum 20 resources supported."}), 400

#     # ── Build graph + detect deadlock ─────────────────────────────
#     try:
#         result = build_graph(processes, resources, requests_, allocations)
#         return jsonify(result), 200
#     except Exception as e:
#         return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# # ------------------------------------------------------------------ #
# #  Sample data endpoint                                                #
# # ------------------------------------------------------------------ #
# @graph_bp.route("/sample", methods=["GET"])
# def sample():
#     """
#     GET /api/sample
#     Returns the classic 4-node circular deadlock example.

#     BUG FIX: was returning a raw dict — Flask 3.x requires jsonify().
#     BUG FIX: was returning wrong node format (raw strings, not objects).
#     """
#     sample_data = {
#         "processes": [
#             {"id": "p0", "label": "Process A"},
#             {"id": "p1", "label": "Process B"}
#         ],
#         "resources": [
#             {"id": "r0", "label": "Resource X"},
#             {"id": "r1", "label": "Resource Y"}
#         ],
#         "requests": [
#             {"process": "p0", "resource": "r0"},
#             {"process": "p1", "resource": "r1"}
#         ],
#         "allocations": [
#             {"resource": "r0", "process": "p1"},
#             {"resource": "r1", "process": "p0"}
#         ]
#     }
#     return jsonify(sample_data), 200












"""
routes/graph_routes.py — Extended (no hard limits on processes/resources)
"""

from flask import Blueprint, request, jsonify
from models.graph_model import GraphInput
from utils.graph_builder import GraphBuilder

graph_bp = Blueprint('graph', __name__)
builder  = GraphBuilder()


def _validate_input(data: dict):
    if not data:
        return "Request body is empty."
    for key in ('processes', 'resources', 'requests', 'allocations'):
        if not isinstance(data.get(key), list):
            return f"'{key}' must be a list."
    if len(data['processes']) == 0 and len(data['resources']) == 0:
        return "At least one process or resource is required."
    # NO hard upper limit — removed 20-node cap
    return None


@graph_bp.route('/analyze', methods=['POST'])
def analyze_graph():
    try:
        data  = request.get_json(force=True)
        error = _validate_input(data)
        if error:
            return jsonify({"error": error}), 400
        graph_input = GraphInput.from_dict(data)
        result      = builder.build_and_analyze(graph_input)
        return jsonify(result.to_dict()), 200
    except Exception as e:
        import traceback
        return jsonify({"error": f"Internal server error: {str(e)}", "trace": traceback.format_exc()}), 500


@graph_bp.route('/sample', methods=['GET'])
def get_sample():
    """Classic deadlock with single-instance resources."""
    return jsonify({
        "processes": [
            {"id": "p0", "label": "Process A"},
            {"id": "p1", "label": "Process B"},
        ],
        "resources": [
            {"id": "r0", "label": "Resource X", "category": "CPU",    "instances": 1},
            {"id": "r1", "label": "Resource Y", "category": "Memory", "instances": 1},
        ],
        "requests":    [{"process": "p0", "resource": "r0"}, {"process": "p1", "resource": "r1"}],
        "allocations": [{"resource": "r0", "process": "p1", "instances": 1},
                        {"resource": "r1", "process": "p0", "instances": 1}],
        "max_demand": [],
    }), 200


@graph_bp.route('/sample_multi', methods=['GET'])
def get_sample_multi():
    """Multi-instance Banker's algorithm sample (safe state)."""
    return jsonify({
        "processes": [
            {"id": "p0", "label": "P0"},
            {"id": "p1", "label": "P1"},
            {"id": "p2", "label": "P2"},
        ],
        "resources": [
            {"id": "r0", "label": "CPU",    "category": "CPU",    "instances": 3},
            {"id": "r1", "label": "Memory", "category": "Memory", "instances": 3},
        ],
        "requests": [
            {"process": "p0", "resource": "r0"},
            {"process": "p1", "resource": "r1"},
        ],
        "allocations": [
            {"resource": "r0", "process": "p0", "instances": 1},
            {"resource": "r0", "process": "p1", "instances": 1},
            {"resource": "r1", "process": "p1", "instances": 1},
            {"resource": "r1", "process": "p2", "instances": 2},
        ],
        "max_demand": [
            {"process": "p0", "resource": "r0", "instances": 2},
            {"process": "p0", "resource": "r1", "instances": 1},
            {"process": "p1", "resource": "r0", "instances": 2},
            {"process": "p1", "resource": "r1", "instances": 2},
            {"process": "p2", "resource": "r0", "instances": 1},
            {"process": "p2", "resource": "r1", "instances": 3},
        ],
    }), 200


@graph_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "message": "RAG Visualizer API running"}), 200
