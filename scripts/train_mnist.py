import tensorflow as tf
import tensorflowjs as tfjs

print("Chargement des données MNIST ...")
(x_train, y_train), (x_test, y_test) = tf.keras.datasets.mnist.load_data()

# Préparation des images
x_train = x_train.reshape(-1, 28, 28, 1).astype('float32') / 255.0
y_train = tf.keras.utils.to_categorical(y_train, 10)

print("Création des neurones...")
model = tf.keras.Sequential([
    tf.keras.layers.Input(shape=(28, 28, 1)),
    tf.keras.layers.Conv2D(16, kernel_size=(3, 3), activation='relu', name='conv2d_1'),
    tf.keras.layers.MaxPooling2D(pool_size=(2, 2), strides=(2, 2), name='max_pooling2d_1'),
    tf.keras.layers.Flatten(name='flatten_1'),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dense(10, activation='softmax')
])

model.compile(optimize='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy'])
print("entrainement en cours ...")
model.fit(x_train, y_train, epochs=5, batch_size=128)

print("Exportation en .h5")
tfjs.converters.save_keras_model(model, 'mnist_web_model')