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

    def validate(self, attrs):
        """
        Limita a 4 álbumes por usuario solo al crear.
        """
        request = self.context.get('request')
        user = getattr(request, 'user', None)

        if user and self.instance is None:
            if user.albums.count() >= 4:
              raise serializers.ValidationError(
                    {"detail": "Ya has creado el máximo de 4 álbumes."}
                )
        return attrs


class PhotoSerializer(serializers.ModelSerializer):
    album_nombre = serializers.CharField(source='album.titulo', read_only=True)
    photographer_nombre = serializers.CharField(source='photographer.nombre', read_only=True)

    class Meta:
        model = Photo
        fields = [
            'id', 'titulo', 'imagen_url', 'imagen_file', 'descripcion', 'size',
            'album', 'photographer', 'album_nombre', 'photographer_nombre',
            'destacado', 'creado_en', 'position'
        ]
        read_only_fields = ['owner']
