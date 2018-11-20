import numpy as np
import nn4t

data = np.genfromtxt('iris.data', delimiter=",")
np.random.shuffle(data)
x_data = data[:, 0:4].astype('f4')
y_data = nn4t.one_hot(data[:, 4].astype(int), 3)

# print y_data
#
# print "\nSome samples..."
# for i in range(20):
#     print x_data[i], " -> ", y_data[i]
# print
# x_data = [[-1., 1.],
#           [-2., 2.],
#           [-3., 3.],
#           [-4., 4.],
#           [50., 5.],
#           [60., 6.],
#           [70., 7.]]
#
# y_data = [1., 0., 0., 0., 1., 1., 1.]
# x_data = [[0, 0],
#           [1, 0],
#           [0, 1],
#           [1, 1]]
#
# y_data = [1, 0, 0, 1]
# y_data = [1., 1., 1., 1., 0., 0., 0.]


net = nn4t.Net(layers=[4, 5, 3])

for i in xrange(900):
    print "Epoch: ", i
    print net.train(x_data, y_data)

print net.layers[0]

for x, y in zip(x_data, y_data):
    print y
    print net.output(x)

