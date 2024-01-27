
// Función para manejar el registro (signup)
async function signup() {
  const nombre = document.getElementById("signupUsername").value;
  const contraseña = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (contraseña !== confirmPassword) {
    alert("Las contraseñas no coinciden. Por favor, inténtalo de nuevo.");
    return;
  }

  try {
    // Obtener todos los usuarios existentes
    const usersResponse = await fetch(`${urlApi}usuarios`);
    const users = await usersResponse.json();

    // Verificar si el nombre de usuario ya existe
    if (users.some((user) => user.nombre === nombre)) {
      alert("Ese nombre de usuario ya existe. Por favor, elige otro.");
      return;
    }

    const response = await fetch(`${urlApi}registro`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, contraseña }),
    });

    const data = await response.json();

    // Puedes manejar la respuesta según tus necesidades
    console.log(data);

    // Limpiar los campos del formulario después del registro
    document.getElementById("signupUsername").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("confirmPassword").value = "";

    // Alerta de exito
    alert("Registro exitoso");

    // Redirigir a la página de inicio de sesión
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error en la solicitud de registro", error);
  }
}

// Función para manejar el inicio de sesión (login)
async function login() {
  const nombre = document.getElementById("loginUsername").value;
  const contraseña = document.getElementById("loginPassword").value;

  // Validar que los campos no estén vacíos
  if (!nombre || !contraseña) {
    alert("Por favor, ingresa tu nombre de usuario y contraseña.");
    return;
  }

  try {
    const response = await fetch(`${urlApi}login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, contraseña }),
    });

    // Verificar si la respuesta fue exitosa
    if (!response.ok) {
      alert(
        "Nombre de usuario o contraseña incorrectos. Por favor, inténtalo de nuevo."
      );
      return;
    }

    const data = await response.json();

    // Puedes manejar la respuesta según tus necesidades
    console.log(data);

    // Limpiar los campos del formulario después del inicio de sesión
    document.getElementById("loginUsername").value = "";
    document.getElementById("loginPassword").value = "";

    // Guardar el id del usuario en el almacenamiento local
    localStorage.setItem("usuario_id", data.usuario_id);

    // Alerta de exito
    alert("Inicio de sesión exitoso");

    // Redirigir a la página de perfil
    window.location.href = "home.html";
  } catch (error) {
    console.error("Error en la solicitud de inicio de sesión", error);
  }
}
