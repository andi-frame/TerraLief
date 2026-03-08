from fastapi import APIRouter
from app.services.estimation import compute_best_route

router = APIRouter()

@router.post("/best-route")
def get_best_route(data: dict):
    # routes = data.get("routes", [])
    # destination = data.get("destination", "")
    # result = compute_best_route(routes, destination)
    # return result
    return {"message": "Best route calculation placeholder"}
