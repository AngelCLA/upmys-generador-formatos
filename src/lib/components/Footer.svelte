<script>
  import MapPin from '@lucide/svelte/icons/map-pin';
  import Phone from '@lucide/svelte/icons/phone';
</script>

<footer class="institutional-footer">
  <div class="footer-container">
    <div class="footer-main">
      <div class="footer-information">
        <div class="footer-brand">
          <img
            src="/Logo-2.png"
            alt="Universidad Politécnica del Mar y la Sierra"
            class="footer-logo"
          />

          <div class="footer-brand-text">
            <span class="footer-eyebrow">UPMYS</span>
            <strong>Portal de Trámites Profesionales</strong>
          </div>
        </div>

        <p class="footer-description">
          Formularios oficiales para generar documentos de Estadías Profesionales y Servicio Social de la
          <strong>Universidad Politécnica del Mar y la Sierra.</strong>
        </p>
      </div>

      <div class="footer-support">
        <span class="footer-heading">Contacto</span>

        <address class="footer-address">
          <span class="footer-contact-item">
            <MapPin size={15} />
            Carretera a Potrerillos del Norote Km. 3, La Cruz, Elota, Sinaloa. C.P. 82700
          </span>

          <a class="footer-contact-item" href="tel:+526961118898">
            <Phone size={15} />
            +52 (696) 111 8898
          </a>
        </address>
      </div>
    </div>

    <div class="footer-divider"></div>

    <div class="footer-bottom">
      <p>
        Desarrollado por
        <strong class="footer-highlight">CLAAngel</strong>
        - Departamento de Sistemas Informáticos
      </p>

      <p>
        <strong class="footer-highlight">
          Universidad Politécnica del Mar y la Sierra
        </strong>
        © {new Date().getFullYear()}. Todos los derechos reservados.
      </p>
    </div>
  </div>
</footer>
