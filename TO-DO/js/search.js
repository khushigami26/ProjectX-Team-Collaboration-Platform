function searchTasks(keyword) {
  return getTasks().filter((task) =>
    task.title.toLowerCase().includes(keyword.toLowerCase())
  );
}
