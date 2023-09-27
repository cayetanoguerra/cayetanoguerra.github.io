**Práctica: Similitud de Documentos con Bag-of-Words y Similitud del Coseno**

**Objetivo:** 
Adquirir experiencia práctica en el cálculo de la similitud entre documentos utilizando el método de bag-of-words y la métrica de similitud del coseno.

**Contexto:** 
Se proporciona un conjunto de 12 documentos relacionados con tecnología móvil y vehículos eléctricos. En el conjunto, algunos documentos tratan solo de tecnología móvil, otros solo de vehículos eléctricos, y hay documentos que abordan ambos temas simultáneamente.

**Instrucciones:**

1. **Preprocesamiento de datos**:
   - Convertir todos los textos a minúsculas.
   - Eliminar signos de puntuación y otros caracteres no alfabéticos.
   - (Opcional) Realizar una eliminación de palabras comunes o "stop words".

2. **Construcción de Bag-of-Words**:
   - Crear un vocabulario global basado en todas las palabras únicas presentes en los documentos.
   - Representar cada documento como un vector en el espacio del vocabulario. La posición de cada palabra en el vector corresponderá a su frecuencia en el documento.

3. **Cálculo de la Similitud del Coseno**:
   - Calcular la similitud del coseno entre todos los pares de documentos utilizando sus representaciones vectoriales.

4. **Análisis**:
   - Identificar qué documentos son más similares entre sí y cuáles son menos similares.
   - Observar la relación entre la similitud y los temas tratados en los documentos. Por ejemplo, determinar si los documentos que tratan sobre el mismo tema tienden a ser más similares entre sí que aquellos que tratan temas diferentes.

5. **Extensión (opcional)**:
   - Implementar una mejora sobre el método bag-of-words, como TF-IDF, y comparar los resultados de similitud del coseno obtenidos con este método mejorado frente al método original.

**Entregables**:
   - Código fuente utilizado para el preprocesamiento, construcción del bag-of-words y cálculo de la similitud del coseno.
   - Un breve informe que detalle los hallazgos, incluyendo una lista de los documentos más similares y menos similares, y cualquier patrón observado en la similitud en relación con los temas de los documentos.

**Consejo**: Se recuerda que la similitud del coseno varía entre 0 y 1, donde 1 indica que los documentos son idénticos y 0 indica que no tienen palabras en común. Una similitud cercana a 1 no necesariamente implica que los documentos traten exactamente el mismo tema, sino que comparten un vocabulario muy similar.
