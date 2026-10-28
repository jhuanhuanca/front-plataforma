<script setup lang="ts">
import LegalDocument from '../components/legal/LegalDocument.vue'
</script>

<template>
  <LegalDocument title="Términos de participación">
    <section>
      <h2 class="text-lg font-semibold text-slate-900">Una cuenta, un dispositivo</h2>
      <p class="mt-2">
        Participas con un nick. No pedimos correo ni nombre civil. Cada dispositivo puede tener una sola cuenta. Si este navegador ya registró un nick, el ingreso tiene que ser con ese mismo nick. Si cambias de navegador, la mesa libera el dispositivo y vuelves a entrar con el mismo nick.
      </p>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-slate-900">Lo que publicas</h2>
      <p class="mt-2">
        Debates, comentarios y votos de las propuestas quedan visibles con tu nick. El texto es tuyo: no publiques datos de otras personas, insultos ni información que no puedas sostener. Otras cuentas pueden reportar un debate, un comentario o una noticia.
      </p>
    </section>
    <section>
      <h2 class="text-lg font-semibold text-slate-900">Tu salida</h2>
      <p class="mt-2">
        Puedes borrar la cuenta desde tu perfil escribiendo el nick. Al hacerlo, el dispositivo queda libre para crear otra cuenta. El detalle de los datos está en la
        <RouterLink to="/privacidad" class="font-medium text-brand underline">política de privacidad</RouterLink>.
      </p>
    </section>
  </LegalDocument>
</template>
