from django import forms
from .models import AppointmentSlot, Patient
from datetime import date


class AppointmentForm(forms.Form):
    patient_name = forms.CharField(label="Nombre completo", max_length=150)
    patient_rut = forms.CharField(label="RUT", max_length=15)
    email = forms.EmailField(label="Correo electrónico", required=False)
    phone = forms.CharField(label="Teléfono", max_length=20, required=False)
    reason = forms.CharField(
        label="Motivo de consulta",
        widget=forms.Textarea(attrs={'rows': 2}),
        required=False,
    )
    slot = forms.ModelChoiceField(
        label="Horario disponible",
        queryset=AppointmentSlot.objects.none()
    )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['slot'].queryset = AppointmentSlot.objects.filter(
            is_available=True,
            date__gte=date.today()
        ).order_by('date', 'time')


class RutSearchForm(forms.Form):
    patient_rut = forms.CharField(label="RUT", max_length=15)

