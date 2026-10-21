import FileCheck from '@lucide/svelte/icons/file-check';
import FileCheck2 from '@lucide/svelte/icons/file-check-2';
import FileText from '@lucide/svelte/icons/file-text';
import ClipboardList from '@lucide/svelte/icons/clipboard-list';
import Handshake from '@lucide/svelte/icons/handshake';
import ExternalLink from '@lucide/svelte/icons/external-link';
import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
import Star from '@lucide/svelte/icons/star';

export const estadiaForms = [
  {
    href: '/estadia/solicitud',
    icon: FileText,
    title: 'Solicitud',
    description: 'Formato F-01. Solicitud de estadía y aceptación del organismo receptor.',
    badge: 'Formulario local',
    badgeIcon: FileCheck,
    badgeType: 'local'
  },
  {
    href: '/estadia/aceptacion',
    icon: Handshake,
    title: 'Aceptación',
    description: 'Formato F-02. Carta de aceptación institucional con vista previa en tiempo real.',
    badge: 'Formulario local',
    badgeIcon: FileCheck,
    badgeType: 'local'
  },
  {
    href: '/estadia/plan-trabajo',
    icon: ClipboardList,
    title: 'Plan de Trabajo',
    description: 'Formato F-03. Programación de actividades y cronograma de estadía.',
    badge: 'Formulario local',
    badgeIcon: FileCheck,
    badgeType: 'local'
  },
  {
    href: 'https://forms-upmys.pages.dev/form?id=evaluacion-pe',
    external: true,
    icon: ClipboardCheck,
    title: 'Evaluación del Proceso de Estadía',
    description: 'Formato F-04. Formulario externo para evaluar el proceso de estadía profesional.',
    badge: 'Enlace externo',
    badgeIcon: ExternalLink,
    badgeType: 'external'
  },
  {
    href: 'https://forms-upmys.pages.dev/form?id=evaluacion-or',
    external: true,
    icon: Star,
    title: 'Evaluación del Alumno al O.R.',
    description: 'Formato F-05. Formulario externo para evaluar al organismo receptor.',
    badge: 'Enlace externo',
    badgeIcon: ExternalLink,
    badgeType: 'external'
  },
  {
    href: '/estadia/terminacion',
    icon: FileCheck2,
    title: 'Terminación',
    description: 'Formato F-06. Carta de terminación y liberación de estadía profesional.',
    badge: 'Formulario local',
    badgeIcon: FileCheck,
    badgeType: 'local'
  }
];

export const servicioSocialForms = [
  {
    href: '/servicio-social/solicitud',
    icon: ClipboardList,
    title: 'Solicitud del PSS',
    description: 'Formato 01. Solicitud de inscripción al Programa Institucional de Servicio Social.',
    badge: 'Formulario local',
    badgeIcon: FileCheck,
    badgeType: 'local'
  },
  {
    href: '/servicio-social/aceptacion',
    icon: Handshake,
    title: 'Aceptación de SS',
    description: 'Formato 02. Carta de aceptación del organismo receptor para el Servicio Social.',
    badge: 'Formulario local',
    badgeIcon: FileCheck,
    badgeType: 'local'
  },
  {
    href: '/servicio-social/informe',
    icon: FileText,
    title: 'Informe Periódico de SS',
    description: 'Formato 03. Informe periódico de actividades, horas y observaciones del Servicio Social.',
    badge: 'Formulario local',
    badgeIcon: FileCheck,
    badgeType: 'local'
  }
];

export const actividadOptions = ['Estancia I', 'Estancia II', 'Estadía', 'Estadía I', 'Estadía II'];
export const actividadSolicitudOptions = ['Estancia 1', 'Estancia 2', 'Estadía', 'Estadía 1', 'Estadía 2'];
