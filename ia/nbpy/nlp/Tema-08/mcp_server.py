from fastmcp import FastMCP

mcp = FastMCP("Asistente de PLN")


# Herramientas: funciones que el modelo puede decidir ejecutar
@mcp.tool
def get_weather(location: str) -> dict:
    """Devuelve la temperatura actual en una ciudad (datos simulados)."""
    return {"ciudad": location, "temperatura": 25, "unidad": "°C"}


@mcp.tool
def contar_palabras(texto: str) -> int:
    """Cuenta cuántas palabras tiene un texto."""
    return len(texto.split())


# Recurso: datos de solo lectura identificados por una URI
@mcp.resource("info://asignatura")
def info_asignatura() -> str:
    """Información básica de la asignatura."""
    return "Procesamiento del Lenguaje Natural. Temas: tokenización, embeddings, transformers, agentes y MCP."


# Prompt: una plantilla de mensaje reutilizable
@mcp.prompt
def resumir(texto: str) -> str:
    """Plantilla para pedir un resumen de un texto."""
    return f"Resume el siguiente texto en una sola frase:\n\n{texto}"


if __name__ == "__main__":
    mcp.run(transport="http", port=8000)
