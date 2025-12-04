from django.db import models
from django.contrib.auth.models import User   

class Photographer(models.Model):
    nombre = models.CharField(max_length=100)
    bio = models.TextField(blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='photographers')  # NUEVO
    
    def __str__(self):
        return self.nombre


class Album(models.Model):
    titulo = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='albums')  # NUEVO

    def __str__(self):
        return self.titulo


class Photo(models.Model):
    SIZE_CHOICES = [
        ('S', 'Pequeña'),
        ('M', 'Mediana'),
        ('L', 'Grande'),
    ]
    

    titulo = models.CharField(max_length=200)
    imagen_url = models.URLField(blank=True, null=True) 
    imagen_file = models.ImageField(upload_to='photos/', blank=True, null=True)
    descripcion = models.TextField(blank=True)
    size = models.CharField(max_length=1, choices=SIZE_CHOICES, default='M')
    album = models.ForeignKey(Album, on_delete=models.CASCADE, related_name='photos')
    photographer = models.ForeignKey(Photographer, on_delete=models.SET_NULL, null=True)
    destacado = models.BooleanField(default=False)
    creado_en = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='photos')  # NUEVO

    position = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.titulo

