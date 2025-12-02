from django.contrib import admin
from .models import Photographer, Album, Photo

@admin.register(Photographer)
class PhotographerAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre')
    search_fields = ('nombre',)

@admin.register(Album)
class AlbumAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'creado_en')
    search_fields = ('titulo',)

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'album', 'photographer', 'size', 'destacado')
    list_filter = ('size', 'album', 'photographer', 'destacado')
    search_fields = ('titulo', 'descripcion')
