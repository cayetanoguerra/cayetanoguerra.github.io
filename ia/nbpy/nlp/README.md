# Entorno para los notebooks de NLP

El entorno está en `.venv` y utiliza Python 3.11. Desde la raíz de `ia`:

```bash
source nbpy/nlp/.venv/bin/activate
```

En el selector de kernel del IDE, elige **Python (NLP)** o el intérprete
`nbpy/nlp/.venv/bin/python`.

Para reconstruirlo desde esta carpeta con `uv`:

```bash
uv venv --python 3.11 --seed .venv
uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python -m nltk.downloader -d .venv/nltk_data punkt punkt_tab stopwords
.venv/bin/python -m ipykernel install --user --name ia-nlp --display-name "Python (NLP)"
```

Las dependencias incluyen los imports y las instrucciones de instalación de los
notebooks de esta carpeta y sus subcarpetas, además del modelo español de spaCy,
los recursos de NLTK y las bibliotecas necesarias para ejecutar notebooks.

Se fijan PyTorch 2.3.0, torchtext 0.18.0 y NumPy 1.26.4 para conservar la
compatibilidad con los notebooks antiguos. También se conservan las API de
Transformers, PEFT y TRL utilizadas en los ejercicios de entrenamiento.

Los ejemplos de entrenamiento en 4 bits de `Tema-06/training` utilizan CUDA,
`bitsandbytes` y rutas de Google Colab (`/content/drive/...`); requieren ese
entorno y sus datos. La versión instalada de `bitsandbytes` no proporciona
aceleración en macOS. Los modelos grandes y datasets de Hugging Face se
descargarán al ejecutar las celdas correspondientes. Los ejercicios que llaman
a servicios externos necesitan sus claves y servidores. El ejemplo antiguo de
`openai.ChatCompletion` en `Tema-05/nb11.ipynb` requiere actualizar ese código
a la API del cliente `OpenAI` que utilizan los notebooks más recientes.
