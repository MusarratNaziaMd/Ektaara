const setupSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join:project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`Socket ${socket.id} joined project:${projectId}`);
    });

    socket.on('leave:project', (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`Socket ${socket.id} left project:${projectId}`);
    });

    socket.on('task:created', (data) => {
      socket.to(`project:${data.projectId}`).emit('task:created', data);
    });

    socket.on('task:updated', (data) => {
      socket.to(`project:${data.projectId}`).emit('task:updated', data);
    });

    socket.on('task:moved', (data) => {
      socket.to(`project:${data.projectId}`).emit('task:moved', data);
    });

    socket.on('project:updated', (data) => {
      socket.to(`project:${data.projectId}`).emit('project:updated', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = setupSocket;
