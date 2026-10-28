import { photo } from './images'

export type PollCategory =
  | 'todas'
  | 'territorio'
  | 'economia'
  | 'cultura'
  | 'movilidad'
  | 'cuidados'

export interface PollOption {
  id: string
  label: string
  votes: number
}

export interface Poll {
  id: string
  title: string
  image: string
  badge: string
  place: string
  category: Exclude<PollCategory, 'todas'>
  options: PollOption[]
  votedOptionId: string | null
}

export const pollCategories: { id: Exclude<PollCategory, 'todas'>; label: string }[] = [
  { id: 'territorio', label: 'Territorio y barrio' },
  { id: 'economia', label: 'Economía local' },
  { id: 'cultura', label: 'Cultura y fiestas' },
  { id: 'movilidad', label: 'Movilidad' },
  { id: 'cuidados', label: 'Cuidados' },
]

export const polls: Poll[] = [
  {
    id: 'p1',
    title: '¿Qué obra va primero en el presupuesto participativo?',
    image: photo('photo-1517048676732-d65bc937f952'),
    badge: 'Abierta',
    place: 'Centro',
    category: 'economia',
    votedOptionId: null,
    options: [
      { id: 'p1a', label: 'Agua en los barrios altos', votes: 42 },
      { id: 'p1b', label: 'Buses después de las 21:00', votes: 36 },
      { id: 'p1c', label: 'Parque en el lote norte', votes: 18 },
    ],
  },
  {
    id: 'p2',
    title: '¿Qué horario de carga prefieres para el mercado?',
    image: photo('photo-1414235077428-338989a2e8c0'),
    badge: 'Cierra hoy',
    place: 'Mercado central',
    category: 'economia',
    votedOptionId: null,
    options: [
      { id: 'p2a', label: '6:00 a 8:00', votes: 27 },
      { id: 'p2b', label: '14:00 a 16:00', votes: 11 },
      { id: 'p2c', label: 'Por turnos de cuadra', votes: 19 },
    ],
  },
  {
    id: 'p3',
    title: '¿La audiencia del aire se hace presencial o también en línea?',
    image: photo('photo-1475721027785-f74eccf877e2'),
    badge: 'En línea',
    place: 'En línea',
    category: 'territorio',
    votedOptionId: null,
    options: [
      { id: 'p3a', label: 'Solo presencial', votes: 8 },
      { id: 'p3b', label: 'Presencial y en línea', votes: 51 },
      { id: 'p3c', label: 'Solo en línea', votes: 14 },
    ],
  },
  {
    id: 'p4',
    title: '¿Dónde conviene el punto de cuidado nocturno?',
    image: photo('photo-1529156069898-49953e39b3ac'),
    badge: 'En vivo',
    place: 'Norte',
    category: 'cuidados',
    votedOptionId: null,
    options: [
      { id: 'p4a', label: 'Junto al mercado', votes: 22 },
      { id: 'p4b', label: 'En la escuela del norte', votes: 17 },
      { id: 'p4c', label: 'En la terminal de buses', votes: 29 },
    ],
  },
]
