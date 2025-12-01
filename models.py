from django.db import models


class Patient(models.Model):
    full_name = models.CharField("Nombre completo", max_length=150)
    rut = models.CharField("RUT", max_length=15, unique=True)
    email = models.EmailField("Correo electrónico", blank=True)
    phone = models.CharField("Teléfono", max_length=20, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.rut})"


class AppointmentSlot(models.Model):
    TYPE_CHOICES = [
        ('MF', 'Médico familiar'),
        ('CC', 'Control crónico'),
        ('EX', 'Toma de exámenes'),
    ]

    date = models.DateField("Fecha")
    time = models.TimeField("Hora")
    type = models.CharField("Tipo de atención", max_length=2, choices=TYPE_CHOICES)
    is_available = models.BooleanField("Disponible", default=True)

    class Meta:
        ordering = ['date', 'time']

    def __str__(self):
        return f"{self.get_type_display()} - {self.date} {self.time} ({'disp.' if self.is_available else 'ocup.'})"


class Appointment(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    slot = models.OneToOneField(AppointmentSlot, on_delete=models.PROTECT)
    reason = models.TextField("Motivo de consulta", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['slot__date', 'slot__time']

    def __str__(self):
        return f"Cita de {self.patient} el {self.slot.date} a las {self.slot.time}"


class Exam(models.Model):
    STATUS_CHOICES = [
        ('P', 'En proceso'),
        ('D', 'Disponible para retiro'),
        ('E', 'Entregado'),
    ]

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    name = models.CharField("Nombre del examen", max_length=100)
    date = models.DateField("Fecha de toma/registro")
    status = models.CharField("Estado", max_length=1, choices=STATUS_CHOICES, default='P')

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.name} - {self.patient} ({self.get_status_display()})"
