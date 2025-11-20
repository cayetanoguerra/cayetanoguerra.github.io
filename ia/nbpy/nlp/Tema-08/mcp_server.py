from fastmcp import FastMCP

mcp = FastMCP("My MCP Server")

@mcp.tool
def get_weather(location: str) -> str:
    return f"La temperatura actual en {location} es 25 grados Centígrados."

if __name__ == "__main__":
    mcp.run(transport="http", port=8000)