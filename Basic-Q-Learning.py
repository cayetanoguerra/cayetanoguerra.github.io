
# coding: utf-8

# # Q Learning

# Partimos de alguna habitación y nuestra misión es salir de la casa.
# 
# <img src="imgs/plano.png" width="30%">

# Las puertas que dan directamente al exterior tienen una recompensa de 100. El resto de puertas no tienen recompensa. El plano de la casa puede ser visto como un grafo.
# 
# <img src="imgs/grafo.png" width="30%">

# La matriz de recompensas $R$ sería:
# 
# $$R = \begin{pmatrix}
# -1 & -1 & -1 & -1 & 0 & -1 \\
# -1 & -1 & -1 & 0 & -1 & 100 \\
# -1 & -1 & -1 & 0 & -1 & -1 \\
# -1 & 0 & 0 & -1 & 0 & -1 \\
# 0 & -1 & -1 & 0 & -1 & 100 \\
# -1 & 0 & -1 & -1 & 0 & 100
# \end{pmatrix}$$
# 
# $Q$ es nuestra tabla de conocimiento del entorno. Inicialmente estará vacía. Ten presente que comenzamos los índices de las tablas $R$ y $Q$ en $0$, no en $1$.
# 
# $$Q = \begin{pmatrix}
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0
# \end{pmatrix}$$
# 
# Representa el valor que tiene un par (estado, acción). Su actualización la haremos con la siguiente fórmula:
# 
# $$Q(s,a) = R(s,a) + \gamma max[Q(s',a')]$$
# 
# Supongamos que comenzamos en la habitación número 1 y, por azar, seleccionamos la acción "ir a 5". La actualización de $Q$ será:
# 
# $$Q(1,5) = R(1,5) + \gamma max[Q(5,1),Q(5,4),Q(5,5)]$$
# 
# El parámetro $\gamma$ es $0.8$. Por tanto, el nuevo valor de la celda (1,5) será:
# 
# $$Q(1,5) = 100 + 0.8 \times max[0,0,0] = 100$$
# 
# Nuestra tabla $Q$ se actualizará de esta forma:
# 
# $$Q = \begin{pmatrix}
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 100 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0
# \end{pmatrix}$$
# 
# Como el siguiente estado es el 5, hemos llegado al final del episodio. Supongamos ahora que partimos del estado 3. Tenemos tres posibles acciones a realizar: ir al estado 1, al 2 o al 4. Supongamos que, también por azar, seleccionamos ir al estado 1.
# 
# $$Q(3,1) = R(3,1) + \gamma max[Q(1,3),Q(1,5)]$$
# 
# Cuyos valores son:
# 
# $$Q(3,1) = 1 + 0.8 \times max[0,100] = 80$$
# 
# Nuestra tabla $Q$ queda:
# 
# $$Q = \begin{pmatrix}
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 100 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 80 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0 \\
# 0 & 0 & 0 & 0 & 0 & 0
# \end{pmatrix}$$
# 
# Hemos llegado de nuevo al estado 5, así que terminamos el episodio y empezaríamos uno nuevo. Si continuamos durante más episodios veremos que la tabla $Q$ se irá actualizando hasta llegar a converger en la matriz $Q^*$. Alcanzada esta convergencia, diremos que nuestro agente ha aprendido a desenvolverse por este entorno.
# 
# ### Implementación del algoritmo
# 
# Establecemos los parámetros del algoritmo

# In[29]:

import random

discount = 0.8 # gamma
learning_rate = 0.5 # alfa
final_state = 5


# Inicializamos la tabla de recompensas

# In[30]:

rewards = [[-1., -1., -1., -1., 0., -1.],
           [-1., -1., -1., 0., -1., 100.],
           [-1., -1., -1., 0., -1., -1.],
           [-1., 0., 0., -1., 0., -1.],
           [0., -1., -1., 0., -1., 100.],
           [-1., 0., -1., -1., 0., 100.]]


# La tabla $Q$ a cero

# In[31]:

Q = [[0., 0., 0., 0., 0., 0.],
     [0., 0., 0., 0., 0., 0.],
     [0., 0., 0., 0., 0., 0.],
     [0., 0., 0., 0., 0., 0.],
     [0., 0., 0., 0., 0., 0.],
     [0., 0., 0., 0., 0., 0.]]


# Fórmula de actualización de la matriz $Q$ 
# 
# $$Q(s,a) = R(s,a) + \gamma max[Q(s',a')]$$

# In[32]:

def qlearning1(s, a):
    Q[s][a] = rewards[s][a] + discount * max(Q[a])
    return


# $$Q(s,a) = \alpha Q(s,a) + (1-\alpha)[R(s,a) + \gamma max[Q(s',a')]$$

# In[33]:

def qlearning2(s, a):
    Q[s][a] = learning_rate * Q[s][a] + (1.0-learning_rate) * (rewards[s][a] + discount * max(Q[a]))
    return


# In[34]:

for _ in xrange(100):

    s = random.randint(0, 5)
    while s == final_state:
        s = random.randint(0, 5)

    keep = True
    while keep:
        a = random.randint(0, 5)
        while rewards[s][a] == -1:
            a = random.randint(0, 5)
        qlearning1(s, a)
        s = a
        if s == final_state:
            keep = False 
            
from tabulate import tabulate
print tabulate(Q, tablefmt="grid")


# ### Ejercicios prácticos

# * Modifica el código para imprimir los estados por donde se pasa y los valores de las celdas de $Q$ que se modifican durante el aprendizaje.
# * Actualiza la tabla $Q$ realizando a mano un episodio con el siguiente recorrido $0\rightarrow4\rightarrow3\rightarrow1\rightarrow5$.
# * Sustituye la primera fórmula del cálculo de $Q$ por la segunda y describe qué diferencias observas.
# * ¿Qué ventajas o desventajas ofrece la primera fórmula de cálculo de $Q$ con respecto a la segunda?
# * Crea una función que, a partir de la matriz $Q^*$, nos lleve a la salida por el camino óptimo desde cualquier habitación.  
# 

# In[ ]:



