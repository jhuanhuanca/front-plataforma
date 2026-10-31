export type AccountTab =
  | 'publicaciones'
  | 'acerca'
  | 'conexiones'
  | 'medios'
  | 'videos'
  | 'convocatorias'
  | 'actividad'

export const accountTabs: { id: AccountTab; label: string }[] = [
  { id: 'publicaciones', label: 'Publicaciones' },
  { id: 'acerca', label: 'Acerca de' },
  { id: 'conexiones', label: 'Conexiones' },
  { id: 'medios', label: 'Medios' },
  { id: 'videos', label: 'Videos' },
  { id: 'convocatorias', label: 'Convocatorias' },
  { id: 'actividad', label: 'Actividad' },
]
