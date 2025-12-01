from django.contrib import admin
from .models import Patient, AppointmentSlot, Appointment, Exam


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'rut', 'email', 'phone')
    search_fields = ('full_name', 'rut')


@admin.register(AppointmentSlot)
class AppointmentSlotAdmin(admin.ModelAdmin):
    list_display = ('date', 'time', 'type', 'is_available')
    list_filter = ('type', 'is_available', 'date')
    ordering = ('date', 'time')


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'slot', 'created_at')
    list_filter = ('slot__date', 'slot__type')
    search_fields = ('patient__full_name', 'patient__rut')


@admin.register(Exam)
class ExamAdmin(admin.ModelAdmin):
    list_display = ('name', 'patient', 'date', 'status')
    list_filter = ('status', 'date')
    search_fields = ('patient__full_name', 'patient__rut', 'name')
