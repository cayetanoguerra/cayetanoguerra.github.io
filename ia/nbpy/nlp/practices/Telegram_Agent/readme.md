# Un agente conversacional en Telegram con la API de OpenAI

> **Práctica 0:  Agentes Conversacionales**

<img src="imagen.jpg" width="600">

Guía paso a paso para construir, desde cero, un bot de Telegram que responde con un modelo de lenguaje, usando Flask como servidor y ngrok para exponerlo a internet.



## Contenido

1. [Arquitectura del sistema](#00--arquitectura-del-sistema)
2. [Requisitos previos](#01--requisitos-previos)
3. [Estructura del proyecto](#02--estructura-del-proyecto)
4. [Paso 1: preparar el entorno Python](#paso-1-preparar-el-entorno-python)
5. [Paso 2: crear el bot de Telegram](#paso-2-crear-el-bot-de-telegram)
6. [Paso 3: obtener la clave de OpenAI](#paso-3-obtener-la-clave-de-la-api-de-openai)
7. [Paso 4: proteger las credenciales](#paso-4-proteger-las-credenciales-con-variables-de-entorno)
8. [Paso 5: escribir el prompt](#paso-5-escribir-el-prompt-del-sistema)
9. [Paso 6: clase `LLM`](#paso-6-la-clase-llm--hablar-con-openai)
10. [Paso 7: servidor Flask](#paso-7-el-servidor-flask--recibir-y-responder-en-telegram)
11. [Paso 8: exponer el servidor con ngrok](#paso-8-exponer-el-servidor-local-con-ngrok)
12. [Paso 9: registrar el webhook](#paso-9-registrar-el-webhook-en-telegram)
13. [Paso 10: probar el bot](#paso-10-probar-el-bot)
14. [Ejercicios propuestos](#13--ejercicios-propuestos)
15. [Problemas comunes](#14--problemas-comunes)

## 00 · Arquitectura del sistema

Antes de tocar código conviene tener claro el camino que recorre un mensaje. Son cuatro piezas, y cada una cumple un único papel:

<p>
<img src="esquema.svg" width="600">
<p>

`llm.py` vive dentro de `agent.py`: es la clase que habla con OpenAI y recuerda la conversación de cada alumno.

En resumen: Telegram entrega cada mensaje a una URL pública (ngrok) que redirige a tu máquina; tu servidor Flask (`agent.py`) lo recibe, se lo pasa a la clase `LLM` (`llm.py`), que consulta a OpenAI, y la respuesta hace el camino de vuelta hasta el chat.

## 01 · Requisitos previos

- **Python 3.10 o superior** instalado y accesible desde la terminal (`python3 --version`).
- Una cuenta de **Telegram** para crear el bot y probarlo.
- Una cuenta en **platform.openai.com** con una clave de API y saldo o crédito disponible.
- Una cuenta gratuita en **ngrok.com**, para exponer tu máquina a internet mientras desarrollas.
- Un editor de código, como VS Code o PyCharm.

## 02 · Estructura del proyecto

La práctica se apoya en tres ficheros principales, cada uno con una responsabilidad distinta:




- `agent.py`          servidor Flask + integración con Telegram
- `llm.py`            clase LLM: habla con la API de OpenAI
- `prompt.txt`        instrucciones del sistema, la personalidad del agente


Separar el prompt en su propio fichero de texto es deliberado: permite cambiar el comportamiento del agente, el tono, los datos que conoce o sus instrucciones, sin tocar ni una línea de código.

## Paso 1: preparar el entorno Python

Crea una carpeta para el proyecto, un entorno virtual y las dependencias:

```bash
mkdir agente-telegram && cd agente-telegram
uv init
uv add flask requests python-dotenv openai
```

Congela las versiones en un fichero para que la práctica sea reproducible en cualquier máquina:

```bash
uv freeze > requirements.txt
```

## Paso 2: crear el bot de Telegram

Telegram delega la creación de bots en otro bot: **@BotFather**.

1. Abre Telegram y busca `@BotFather`.
2. Envía el comando `/newbot`.
3. Elige un **nombre visible**, por ejemplo `Asistente PLN`, y un **username** que termine en `bot`, por ejemplo `pln_ulpgc_bot`.
4. BotFather responderá con un **token**, con este aspecto: `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`. Guárdalo: es la credencial que identifica a tu bot.

> **Advertencia:** ese token equivale a una contraseña. Cualquiera que lo tenga puede controlar tu bot. No lo escribas directamente en el código ni lo subas a un repositorio público. En el paso 4 se explica dónde guardarlo.

## Paso 3: obtener la clave de la API de OpenAI

1. Entra en `platform.openai.com` e inicia sesión.
2. Ve a **Dashboard → API keys** y pulsa **Create new secret key**.
3. Copia la clave al momento: empieza por `sk-...` y solo se muestra una vez.
4. Comprueba en **Billing** que la cuenta tiene crédito disponible; sin saldo, las llamadas devuelven un error 429.

## Paso 4: proteger las credenciales con variables de entorno

Ahora tienes dos secretos: el token de Telegram y la clave de OpenAI. Escribirlos directamente dentro de `agent.py` o `llm.py` es la manera más rápida de que acaben filtrados, por ejemplo, en cuanto el proyecto se suba a GitHub.

Crea un fichero `.env` en la raíz del proyecto:

```dotenv
TELEGRAM_TOKEN=tu_token_de_botfather
OPENAI_API_KEY=sk-tu_clave_de_openai
NGROK_URL=https://tu-subdominio.ngrok-free.app
```

Y un `.gitignore` que lo excluya de cualquier commit:

```gitignore
.env
venv/
__pycache__/
```

Con `python-dotenv`, ambos ficheros pasan a leer las claves así, en vez de tenerlas escritas dentro.

### `llm.py`

```python
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]
```

### `agent.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()
TELEGRAM_TOKEN = os.environ["TELEGRAM_TOKEN"]
NGROK_URL = os.environ["NGROK_URL"]
```

> Este paso no cambia el comportamiento del bot; solo cambia dónde se encuentran las claves. Es la diferencia entre una práctica que se puede compartir o subir a un repositorio y una que no.

## Paso 5: escribir el prompt del sistema

`prompt.txt` es la primera instrucción que recibe el modelo, antes de cualquier mensaje del usuario. Define quién es el agente y qué sabe.

### `prompt.txt`

```text
Eres un agente personal que da servicio a la asignatura llamada
"Procesamiento del Lenguaje Natural (PLN)" de la Universidad de
Las Palmas de Gran Canaria. Tu misión es responder a preguntas
relacionadas con la asignatura.

La información de la que se dispone es:

Profesor:
- Nombre: Cayetano Guerra Artal
- Despacho: Edificio de Informática, despacho 3-3

Horario de la asignatura:
- Lunes: 8:30 a 9:30 clase de teoría
- Martes: 11:30 a 13:30 clase de teoría
- Viernes: 11:30 a 13:30 clase de prácticas en laboratorio
```

Este texto se envía como mensaje de rol `system` en cada conversación. Es el lugar natural para añadir más contexto de la asignatura: temario, bibliografía, fechas de examen, enlaces al campus virtual, etc. Cuanto más preciso el prompt, mejor.

## Paso 6: la clase `LLM` - hablar con OpenAI

`llm.py` encapsula toda la conversación con el modelo. Su pieza clave es `active_users`: un diccionario que guarda, para cada `chat_id` de Telegram, el historial completo de mensajes.

### `llm.py`

```python
class LLM:
	def __init__(self):
		self.client = OpenAI(api_key=OPENAI_API_KEY)
		self.active_users = {}
		# prompt.txt se carga una sola vez, al arrancar
		with open("prompt.txt", "r") as file:
			self.prompt = file.read()

	def chat(self, id, text):
		# primer mensaje de este chat_id: arranca el historial
		if id not in self.active_users:
			self.active_users[id] = {"messages": [
				{"role": "system", "content": self.prompt}
			]}

		self.active_users[id]["messages"].append(
			{"role": "user", "content": text})

		response = self.client.chat.completions.create(
			model="gpt-4o-mini",
			messages=self.active_users[id]["messages"],
			temperature=1, max_tokens=256,
		)

		bot_response = response.choices[0].message.content
		self.active_users[id]["messages"].append(
			{"role": "assistant", "content": bot_response})
		return bot_response
```

Dos ideas merecen atención en clase:

- **Memoria por usuario:** cada `chat_id` tiene su propia lista de mensajes, así que el bot puede hablar con varios alumnos a la vez sin mezclar sus conversaciones.
- **Memoria en RAM:** `active_users` vive en memoria del proceso. Si el servidor se reinicia, todas las conversaciones se pierden. Es un buen punto de partida para discutir alternativas: guardar el historial en un fichero, en SQLite o limitar cuántos turnos se conservan.

## Paso 7: el servidor Flask - recibir y responder en Telegram

`agent.py` expone dos rutas HTTP. Telegram nunca llama a tu bot directamente: en su lugar, envía cada mensaje nuevo mediante un **webhook**, una petición POST a una URL que tú registras de antemano.

| Ruta | Método | Función |
| --- | --- | --- |
| `/telegram` | POST | Recibe cada mensaje entrante y responde con la contestación del modelo. |
| `/telegram/setwebhook/` | GET | Le dice a Telegram a qué URL debe enviar los mensajes a partir de ahora. |

### `agent.py`

```python
@app.route("/telegram", methods=['GET', 'POST'])
def reply_telegram():
	if request.method == 'POST':
		msg = request.get_json()

		# Telegram distingue un mensaje nuevo de uno editado
		if 'message' in msg:
			m = msg['message']['text']
			id = msg['message']['chat']['id']
		else:
			m = msg['edited_message']['text']
			id = msg['edited_message']['chat']['id']

		if m == '/start':
			requests.get(
				f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage?chat_id={id}&text=¡Hola!"
			)
		else:
			response = chatbot.chat(id, m)
			requests.get(
				f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage?chat_id={id}&text={response}"
			)

		return Response('ok', status=200)
```

El patrón es siempre el mismo: leer el JSON que envía Telegram, extraer texto y `chat_id`, pedirle una respuesta al agente y devolvérsela a Telegram con una llamada a `sendMessage`.

> Enviar el texto como parámetro de una URL (`?text=...`) funciona en la práctica, pero rompe con emojis, saltos de línea o el carácter `&`. Como ejercicio, sustituye esa llamada por un `requests.post(...)` con el texto en el cuerpo JSON; es una mejora natural.

## Paso 8: exponer el servidor local con ngrok

Telegram necesita una URL **pública** y con HTTPS para enviar el webhook; tu `localhost:5000` no es alcanzable desde fuera de tu red. ngrok abre un túnel temporal que resuelve justo eso.

```bash
# instalar en macOS
brew install ngrok

# autenticar una sola vez, con el token de tu cuenta ngrok.com
ngrok config add-authtoken TU_AUTHTOKEN

# exponer el puerto en el que corre Flask
ngrok http 5000
```

ngrok muestra una URL como `https://6906267213b0.ngrok-free.app`. Cópiala en tu `.env`, en la variable `NGROK_URL`.

> En el plan gratuito, la URL de ngrok cambia cada vez que reinicias el túnel. Cada reinicio obliga a repetir el paso 9 con la nueva URL.

## Paso 9: registrar el webhook en Telegram

Con ngrok y Flask corriendo en paralelo, solo falta decirle a Telegram dónde entregar los mensajes.

```bash
# en una terminal
python agent.py

# en otra, con ngrok ya activo
ngrok http 5000
```

Después, visita en el navegador la ruta que registra el webhook:

```text
http://localhost:5000/telegram/setwebhook/
```

Esa ruta ejecuta, con tus credenciales, una llamada equivalente a esta:

```text
https://api.telegram.org/bot<TELEGRAM_TOKEN>/setWebhook?url=<NGROK_URL>/telegram
```

Un `"Success"` en pantalla confirma que Telegram ya sabe a qué URL reenviar cada mensaje nuevo.

## Paso 10: probar el bot

- Abre el chat con tu bot en Telegram; búscalo por el username elegido en el paso 2.
- Envía `/start`: debe responder `¡Hola!`.
- Pregunta algo relacionado con el prompt, por ejemplo: “¿En qué despacho está el profesor?”.
- Haz una segunda pregunta que dependa de la primera, para comprobar que recuerda el contexto de la conversación.
- Revisa la terminal donde corre `agent.py`: cada request de Telegram debería aparecer ahí en tiempo real.



## Paso 11: Problemas comunes

| Síntoma | Causa probable |
| --- | --- |
| El bot no responde nada | El webhook apunta a una URL de ngrok caducada. Repite el paso 9 con la URL actual. |
| Error 401 de Telegram | `TELEGRAM_TOKEN` es incorrecto o tiene espacios de más al copiarlo. |
| Error 429 de OpenAI | No hay crédito disponible en la cuenta o se ha superado el límite de peticiones por minuto. |
| `setwebhook` devuelve `Fail` | Flask no está accesible desde ngrok. Comprueba que `agent.py` sigue corriendo y en el mismo puerto. |
| El bot “olvida” la conversación | El servidor se reinició y `active_users`, al vivir en memoria, se vació. |
| Respuestas cortadas a mitad de frase | `max_tokens=256` es el límite de longitud de la respuesta; auméntalo si hace falta. |

---


