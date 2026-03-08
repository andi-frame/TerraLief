from fastapi import FastAPI

app = FastAPI()

@app.post("/best-route")
def best_route(data: dict):
    # routes = data["routes"]
    # destination = data["destination"]

    # result = compute_best_route(routes, destination)

    # return result
    pass