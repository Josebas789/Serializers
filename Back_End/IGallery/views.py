from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Album, Photo, Photographer
from .serializers import AlbumSerializer, PhotoSerializer, PhotographerSerializer


class AlbumViewSet(ModelViewSet):
    queryset = Album.objects.all()
    serializer_class = AlbumSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Album.objects.filter(owner=self.request.user).order_by('-creado_en')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PhotographerViewSet(ModelViewSet):
    queryset = Photographer.objects.all()
    serializer_class = PhotographerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Photographer.objects.filter(owner=self.request.user).order_by('nombre')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PhotoViewSet(ModelViewSet):
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['album', 'photographer', 'destacado', 'size']
    search_fields = ['titulo', 'descripcion']
    ordering_fields = ['creado_en', 'position']

    def get_queryset(self):
        return Photo.objects.filter(owner=self.request.user).order_by('position', '-creado_en')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
