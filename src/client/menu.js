const enterGame = (event) => {
  if (event.key === "Enter" && ref.nameinput.value.length > 0) {
    ref.menu.style.display = 'none';
    initGame(ref.nameinput.value);
    ref.nameinput.blur();
  }
}

ref.nameinput.addEventListener("keydown", enterGame);