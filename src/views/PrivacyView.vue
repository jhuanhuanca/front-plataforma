<script setup lang="ts">
import LegalDocument from '../components/legal/LegalDocument.vue'
</script>

<template>
  <LegalDocument title="Privacidad">
    <section>
      <h2 class="text-lg font-semibold text-slate-900">Qué guarda la cuenta</h2>
      <p class="mt-2">
        Guardamos el nick y una huella del dispositivo. Esa huella resume el navegador, el idioma, la plataforma y la dirección de red; no se muestra en los debates ni en las noticias. La sesión usa un token que se revoca al salir.
      </p>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-slate-900">Qué ve el resto</h2>
      <p class="mt-2">
        En público aparece tu nick junto al texto que publicaste, los conteos de votos y los totales de la plataforma. Esos totales no incluyen nicks ni identificadores de cuenta.
      </p>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-slate-900">Métricas, solo si aceptas</h2>
      <p class="mt-2">
        El perfil de participación, calidad, respeto e influencia se calcula únicamente si lo aceptas. Puedes dejarlo apagado al crear la cuenta y cambiarlo después en tu perfil. Al apagarlo, ese perfil se borra. La lista de candidatos a líder, cuando existe, queda en privado.
      </p>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-slate-900">Borrar la cuenta</h2>
      <p class="mt-2">
        Borrar la cuenta elimina el nick, la sesión, la huella y el perfil de métricas. Las reglas de participación están en los
        <RouterLink to="/terminos" class="font-medium text-brand underline">términos</RouterLink>.
      </p>
    </section>
  </LegalDocument>
</template>
