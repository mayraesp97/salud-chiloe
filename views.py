from django.shortcuts import render, redirect
from django.contrib import messages

from .forms import AppointmentForm, RutSearchForm
from .models import Patient, Appointment, Exam


def index(request):
    """
    Página de inicio: descripción general del sistema.
    """
    return render(request, 'consultorio/index.html')


def agendar_visita(request):
    """
    Vista para agendar una visita:
    - Muestra horarios disponibles (a través del formulario).
    - Crea paciente si no existe.
    - Crea Appointment y marca slot como no disponible.
    """
    if request.method == 'POST':
        form = AppointmentForm(request.POST)
        if form.is_valid():
            patient_name = form.cleaned_data['patient_name']
            patient_rut = form.cleaned_data['patient_rut']
            email = form.cleaned_data['email']
            phone = form.cleaned_data['phone']
            reason = form.cleaned_data['reason']
            slot = form.cleaned_data['slot']

            patient, created = Patient.objects.get_or_create(
                rut=patient_rut,
                defaults={
                    'full_name': patient_name,
                    'email': email,
                    'phone': phone,
                }
            )

            # Si ya existía, actualizamos datos básicos
            if not created:
                patient.full_name = patient_name
                if email:
                    patient.email = email
                if phone:
                    patient.phone = phone
                patient.save()

            # Crear cita
            appointment = Appointment.objects.create(
                patient=patient,
                slot=slot,
                reason=reason
            )

            # Marcar slot como ocupado
            slot.is_available = False
            slot.save()

            messages.success(
                request,
                f"Tu hora fue agendada para el {slot.date} a las {slot.time}."
            )
            return redirect('agendar')
        else:
            messages.error(request, "Por favor corrige los errores del formulario.")
    else:
        form = AppointmentForm()

    return render(request, 'consultorio/agendar.html', {'form': form})


def mis_visitas(request):
    """
    Buscar y mostrar citas de un paciente por RUT.
    """
    appointments = None
    rut = None

    if request.method == 'POST':
        form = RutSearchForm(request.POST)
        if form.is_valid():
            rut = form.cleaned_data['patient_rut']
            appointments = Appointment.objects.filter(
                patient__rut__iexact=rut
            ).select_related('slot', 'patient')
            if not appointments:
                messages.info(request, "No se encontraron visitas para el RUT ingresado.")
    else:
        form = RutSearchForm()

    context = {
        'form': form,
        'appointments': appointments,
        'rut': rut,
    }
    return render(request, 'consultorio/mis_visitas.html', context)


def mis_examenes(request):
    """
    Buscar y mostrar exámenes de un paciente por RUT.
    """
    exams = None
    rut = None

    if request.method == 'POST':
        form = RutSearchForm(request.POST)
        if form.is_valid():
            rut = form.cleaned_data['patient_rut']
            exams = Exam.objects.filter(
                patient__rut__iexact=rut
            ).select_related('patient')
            if not exams:
                messages.info(request, "No se encontraron exámenes para el RUT ingresado.")
    else:
        form = RutSearchForm()

    context = {
        'form': form,
        'exams': exams,
        'rut': rut,
    }
    return render(request, 'consultorio/mis_examenes.html', context)
