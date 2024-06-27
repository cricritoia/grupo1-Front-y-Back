
function validarFormulario(event) {
  event.preventDefault();


const form = document.getElementById('formulario');
const nombreInput = document.getElementById('nombre').value;
const emailInput = document.getElementById('email').value;
const telefonoInput = document.getElementById('telefono').value;
const mensajeInput = document.getElementById('mensaje').value;
const selectInput = document.getElementById('opciones').value;
const presupuestoInput = document.getElementById('presupuesto').value;
const archivoInput = document.getElementById('archivo').value;
const contactoTelefonoRadioBtn = document.getElementById('contactarTelefono').value;
const contactoEmailRadioBtn = document.getElementById('contactarEmail').value;
const fechaInput = document.getElementById('fecha').value;
const horaInput = document.getElementById('hora').value;


  if (
    nombreInput.trim() === '' || 
    emailInput.trim() === '' || 
    telefonoInput.trim() === ''|| 
    mensajeInput.trim() === '' ||
    selectInput.trim() === '' ||
    presupuestoInput.trim() === ''||
    archivoInput.trim() === ''||
    fechaInput.trim() === ''||
    horaInput.trim() === ''
  )  {
    
    alert('Por favor, completa todos los campos.');
    return;
  }
  event.target.submit();
}
document.getElementById('formulario').addEventListener('submit', validarFormulario);

