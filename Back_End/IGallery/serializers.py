from rest_framework import serializers
from .models import Photographer, Album, Photo

class PhotographerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photographer
        fields = '__all__'
        read_only_fields = ['owner']

class AlbumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Album
        fields = '__all__'
        read_only_fields = ['owner']  

class PhotoSerializer(serializers.ModelSerializer):
    album_nombre = serializers.CharField(source='album.titulo', read_only=True)
    photographer_nombre = serializers.CharField(source='photographer.nombre', read_only=True)

    class Meta:
        model = Photo
        fields = [
            'id',
            'titulo',
            'imagen_url',
            'descripcion',
            'size',
            'album',
            'photographer',
            'album_nombre',
            'photographer_nombre',
            'destacado',
            'creado_en',
            'position',
        ]
        read_only_fields = ['owner']
