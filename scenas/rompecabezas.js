class Rompecabezas extends Phaser.Scene {
  constructor() {
    super({ key: 'Rompecabezas' });

    // Configuración del juego
    this.score = 0;
    this.errorsDetected = 0;
    this.piecesFixed = 0;
    this.requiredErrors = 4;
    this.requiredFixes = 2;
    this.targetScore = 500; // Puntuación objetivo para pasar de nivel
    this.levelPassed = false;
    this.gameWon = false;
    this.gameLost = false;

    // Nuevas propiedades para mejor jugabilidad
    this.gameStarted = false;
    this.tutorialStep = 0;
    this.piecesProcessed = 0;
    this.consecutiveGoodScans = 0;
  }

  createSimpleBackground() {
    // Fondo simple con gradiente sutil
    const background = this.add.graphics();
    background.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x2a2a3e, 0x2a2a3e, 1);
    background.fillRect(0, 0, this.screenWidth, this.screenHeight);

    // Líneas decorativas simples en las esquinas
    const cornerLines = this.add.graphics();
    cornerLines.lineStyle(2, 0x00ff88, 0.4);
    // Esquina superior izquierda
    cornerLines.lineBetween(0, 0, 40, 0);
    cornerLines.lineBetween(0, 0, 0, 40);
    // Esquina superior derecha
    cornerLines.lineBetween(this.screenWidth - 40, 0, this.screenWidth, 0);
    cornerLines.lineBetween(this.screenWidth, 0, this.screenWidth, 40);
    // Esquina inferior izquierda
    cornerLines.lineBetween(0, this.screenHeight - 40, 0, this.screenHeight);
    cornerLines.lineBetween(0, this.screenHeight, 40, this.screenHeight);
    // Esquina inferior derecha
    cornerLines.lineBetween(this.screenWidth - 40, this.screenHeight, this.screenWidth, this.screenHeight);
    cornerLines.lineBetween(this.screenWidth, this.screenHeight - 40, this.screenWidth, this.screenHeight);
  }

  toggleTutorial() {
    if (this.tutorialGroup) {
      const isVisible = this.tutorialGroup.getChildren()[0].visible;
      this.tutorialGroup.getChildren().forEach(child => {
        child.setVisible(!isVisible);
      });
    }
  }

  preload() {
    // Cargar assets externos
    this.load.svg('piece_good', 'assets/rompecabezas/piece_good.svg');
    this.load.svg('piece_defective', 'assets/rompecabezas/piece_defective.svg');
    this.load.image('sensor', 'assets/rompecabezas/sensor.png');
  }

  create() {
    // Obtener dimensiones de la pantalla
    this.screenWidth = this.scale.width;
    this.screenHeight = this.scale.height;

    // Crear fondo simple sin animaciones
    this.createSimpleBackground();

    // Inicializar grupos primero
    this.pieces = this.add.group();
    this.sensors = [];

    // Crear elementos de la interfaz con mejor espaciado
    this.createUIBackground();
    this.createInfoPanel();
    this.createProductionLine();
    this.createSensors();
    this.createTutorial();

    // Inicializar el juego
    this.initializeGame();
  }

  createUIBackground() {
    // Panel superior para información con mejor espaciado
    const topPanel = this.add.graphics();
    topPanel.fillStyle(0x2a2a3e, 0.9);
    const topY = this.screenHeight * 0.08; // Más arriba para dar más espacio general
    const topHeight = this.screenHeight * 0.12; // Más alto para mejor legibilidad
    topPanel.fillRoundedRect(30, topY, this.screenWidth - 60, topHeight, 8); // Más margen lateral
    topPanel.lineStyle(2, 0x00ff88, 0.8);
    topPanel.strokeRoundedRect(30, topY, this.screenWidth - 60, topHeight, 8);
  }

  createInfoPanel() {
    const fontSize = Math.min(this.screenWidth/30, this.screenHeight/22, 28);
    const firstRowY = this.screenHeight * 0.08; // Movido más arriba
    const secondRowY = this.screenHeight * 0.14; // Mejor separación

    // Primera fila de información con espaciado optimizado
    this.scoreText = this.add.text(40, firstRowY, '⭐ Puntos: 0', {
      fontSize: fontSize + 'px',
      fill: '#00ff88',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.progressText = this.add.text(this.screenWidth * 0.6, firstRowY, '🎯 Objetivo: 0', {
      fontSize: fontSize + 'px',
      fill: '#00ff88',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });

    // Texto de estado movido debajo del botón (se creará en createTutorial)
    // this.statusText se creará en createTutorial para mejor posicionamiento
  }

  createProductionLine() {
    // Línea de producción bajada aún más
    const lineY = this.screenHeight * 0.49; // Bajada aún más
    const lineWidth = this.screenWidth * 0.42; // Ancho ajustado
    const lineX = this.screenWidth * 0.06; // Mejor margen izquierdo

    // Fondo de la línea de producción
    const productionBg = this.add.graphics();
    productionBg.fillStyle(0x2a2a2a, 0.9);
    productionBg.fillRect(lineX, lineY - this.screenHeight * 0.08, lineWidth, this.screenHeight * 0.16);
    productionBg.lineStyle(3, 0x555555, 1);
    productionBg.strokeRect(lineX, lineY - this.screenHeight * 0.08, lineWidth, this.screenHeight * 0.16);

    // Carril central donde se mueven las piezas
    const centralLane = this.add.graphics();
    centralLane.fillStyle(0x444444, 0.8);
    const laneHeight = this.screenHeight * 0.06;
    centralLane.fillRect(lineX + 20, lineY - laneHeight/2, lineWidth - 40, laneHeight);
    centralLane.lineStyle(2, 0x666666, 1);
    centralLane.strokeRect(lineX + 20, lineY - laneHeight/2, lineWidth - 40, laneHeight);

    // Flechas direccionales adaptativas
    const arrowCount = Math.floor(lineWidth / 100);
    for (let i = 1; i < arrowCount; i++) {
      const x = lineX + (i * lineWidth / arrowCount);
      this.add.text(x, lineY, '▶', {
        fontSize: Math.min(this.screenWidth/25, this.screenHeight/18, 32) + 'px',
        fill: '#00ff88',
        fontWeight: 'bold'
      }).setOrigin(0.5);
    }

    // Etiquetas de zona con espaciado optimizado
    this.add.text(lineX + 60, lineY - this.screenHeight * 0.10, '🏭 ENTRADA\nDE PIEZAS', {
      fontSize: Math.min(this.screenWidth/35, this.screenHeight/25, 22) + 'px',
      fill: '#ffff00',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(lineX + lineWidth - 60, lineY - this.screenHeight * 0.10, '📦 SALIDA\nFINAL', {
      fontSize: Math.min(this.screenWidth/35, this.screenHeight/25, 22) + 'px',
      fill: '#ffff00',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    // Las flechas ya indican la dirección del flujo
  }

  createSensors() {
    // Sensor de inspección subido y centrado con respecto a la banda
    const lineX = this.screenWidth * 0.06; // Mismo margen que la banda
    const lineWidth = this.screenWidth * 0.42; // Mismo ancho que la banda
    const centerX = lineX + (lineWidth / 2); // Centro de la banda
    const sensorPositions = [
      { x: centerX, y: this.screenHeight * 0.25, name: 'Sensor de Inspección' }
    ];

    sensorPositions.forEach((pos, index) => {
      // Base del sensor adaptativa
      const baseWidth = Math.min(this.screenWidth/25, 40);
      const baseHeight = Math.min(this.screenHeight/35, 25);
      const sensorBase = this.add.graphics();
      sensorBase.fillStyle(0x444444, 1);
      sensorBase.fillRoundedRect(pos.x - baseWidth/2, pos.y - baseHeight/2, baseWidth, baseHeight, 5);

      // Sensor principal con tamaño adaptativo
      const sensorScale = Math.min(this.screenWidth/2000, this.screenHeight/1500, 0.4);
      const sensor = this.add.image(pos.x, pos.y, 'sensor')
        .setScale(sensorScale)
        .setInteractive({ cursor: 'pointer' });

      // Etiqueta del sensor con mejor espaciado
      const label = this.add.text(pos.x, pos.y + this.screenHeight * 0.08, pos.name, {
        fontSize: Math.min(this.screenWidth/50, this.screenHeight/35, 16) + 'px',
        fill: '#ffffff',
        fontWeight: 'bold'
      }).setOrigin(0.5);

      // Indicador de estado
      const indicatorSize = Math.min(this.screenWidth/100, this.screenHeight/80, 8);
      const statusIndicator = this.add.graphics();
      statusIndicator.fillStyle(0x666666);
      statusIndicator.fillCircle(pos.x + baseWidth/2 + 10, pos.y - baseHeight/2 - 10, indicatorSize);

      // Rango de detección visual
      const detectionRadius = Math.min(this.screenWidth/8, this.screenHeight/6, 100);
      const detectionRange = this.add.graphics();
      detectionRange.lineStyle(2, 0x00ffff, 0.3);
      detectionRange.strokeCircle(pos.x, this.screenHeight * 0.5, detectionRadius);
      detectionRange.setAlpha(0);

      // Eventos del sensor
      sensor.on('pointerover', () => {
        sensor.setTint(0x00ffff);
        detectionRange.setAlpha(1);
        this.tweens.add({
          targets: sensor,
          scaleX: sensorScale * 1.2,
          scaleY: sensorScale * 1.2,
          duration: 200
        });
      });

      sensor.on('pointerout', () => {
        sensor.clearTint();
        detectionRange.setAlpha(0);
        sensor.setScale(sensorScale);
      });

      sensor.on('pointerdown', () => {
        this.useSensor(sensor, pos, statusIndicator);
      });

      this.sensors.push({
        sensor: sensor,
        position: pos,
        statusIndicator: statusIndicator,
        detectionRange: detectionRange
      });
    });
  }

  createTutorial() {
    // Crear grupo para el tutorial
    this.tutorialGroup = this.add.group();

    // Panel lateral derecho reducido para evitar que las piezas se salgan
    const rightPanel = this.add.graphics();
    rightPanel.fillStyle(0x1a1a2e, 0.95);
    const panelX = this.screenWidth * 0.60; // Movido más a la derecha
    const panelWidth = this.screenWidth * 0.38; // Más pequeño
    const panelHeight = this.screenHeight * 0.60; // Altura reducida
    const panelY = this.screenHeight * 0.25; // Posición ajustada
    rightPanel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    rightPanel.lineStyle(2, 0x00ff88, 0.8);
    rightPanel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);

    this.tutorialGroup.add(rightPanel);

    // Título del tutorial ajustado al panel más pequeño
    const tutorialTitle = this.add.text(this.screenWidth * 0.79, this.screenHeight * 0.30, '📚 CÓMO JUGAR', {
      fontSize: Math.min(this.screenWidth/28, this.screenHeight/20, 26) + 'px',
      fill: '#00ff88',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    this.tutorialGroup.add(tutorialTitle);

    // Instrucciones verticales en el panel derecho con mejor espaciado
    const instructions = [
      {
        title: '1️⃣ DETECTAR',
        text: 'Haz clic en el SENSOR cuando\nlas piezas pasen cerca de él'
      },
      {
        title: '2️⃣ IDENTIFICAR',
        text: 'Las piezas ROJAS son defectuosas\ny deben ser reparadas'
      },
      {
        title: '3️⃣ REPARAR',
        text: 'Haz clic en las piezas defectuosas\ndetectadas para repararlas'
      },
    ];

    const startY = this.screenHeight * 0.37; // Posición inicial ajustada
    const stepHeight = this.screenHeight * 0.10; // Espaciado reducido para panel más pequeño

    instructions.forEach((instruction, index) => {
      const y = startY + (index * stepHeight);

      // Título de cada paso centrado en el panel más pequeño
      const stepTitle = this.add.text(this.screenWidth * 0.79, y, instruction.title, {
        fontSize: Math.min(this.screenWidth/35, this.screenHeight/28, 18) + 'px',
        fill: '#ffff00',
        fontWeight: 'bold',
        align: 'center'
      }).setOrigin(0.5);

      this.tutorialGroup.add(stepTitle);

      // Descripción de cada paso con texto más pequeño
      const stepDescription = this.add.text(this.screenWidth * 0.79, y + this.screenHeight * 0.035, instruction.text, {
        fontSize: Math.min(this.screenWidth/45, this.screenHeight/35, 14) + 'px',
        fill: '#ffffff',
        align: 'center',
        lineSpacing: 1
      }).setOrigin(0.5);

      this.tutorialGroup.add(stepDescription);
    });

    // Botón de inicio adaptativo
    this.startButton = this.add.text(this.screenWidth * 0.1, this.screenHeight * 0.68, '🚀 INICIAR JUEGO', {
      fontSize: Math.min(this.screenWidth/18, this.screenHeight/12, 36) + 'px',
      fill: '#ffffff',
      backgroundColor: '#00aa44',
      padding: { x: 20, y: 12 },
      fontWeight: 'bold'
    }).setOrigin(0, 0.5).setInteractive({ cursor: 'pointer' });

    this.tutorialGroup.add(this.startButton);

    this.startButton.on('pointerdown', () => this.startGame());

    // Efectos hover para el botón
    this.startButton.on('pointerover', () => {
      this.startButton.setTint(0xcccccc);
      this.startButton.setScale(1.05);
    });

    this.startButton.on('pointerout', () => {
      this.startButton.clearTint();
      this.startButton.setScale(1);
    });

    // Texto de estado bajado más debajo del botón de iniciar
    this.statusText = this.add.text(this.screenWidth * 0.1, this.screenHeight * 0.78, 'Presiona "INICIAR JUEGO" para comenzar', {
      fontSize: Math.min(this.screenWidth/35, this.screenHeight/25, 20) + 'px',
      fill: '#ffffff',
      fontWeight: 'bold',
      align: 'left',
      wordWrap: { width: this.screenWidth * 0.4 }
    }).setOrigin(0, 0.5);

    this.tutorialGroup.add(this.statusText);

    // Botón de ayuda eliminado por solicitud del usuario
  }

  initializeGame() {

    this.gameStarted = false;
    this.updateStatus('Presiona "INICIAR JUEGO" para comenzar');
  }

  updateStatus(message) {
    if (this.statusText) {
      this.statusText.setText(` ${message}`);
    }
  }

  startGame() {
    this.gameStarted = true;


    // Mantener el tutorial visible durante el juego
    // No ocultar el tutorialGroup para que las instrucciones permanezcan visibles

    this.updateStatus('¡Juego iniciado! Usa los sensores para inspeccionar piezas');

    // Mostrar mensaje de inicio con animación adaptativa
    const startMessage = this.add.text(this.screenWidth/2, this.screenHeight * 0.45, '¡JUEGO INICIADO!', {
      fontSize: Math.min(this.screenWidth/18, this.screenHeight/14, 42) + 'px',
      fill: '#00ff88',
      fontWeight: 'bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      wordWrap: { width: this.screenWidth - 40 }
    }).setOrigin(0.5);

    const subMessage = this.add.text(this.screenWidth/2, this.screenHeight * 0.52, '¡Usa el sensor para detectar piezas defectuosas!', {
      fontSize: Math.min(this.screenWidth/32, this.screenHeight/25, 24) + 'px',
      fill: '#ffffff',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2,
      wordWrap: { width: this.screenWidth - 40 }
    }).setOrigin(0.5);

    // Animación de entrada
    startMessage.setScale(0);
    subMessage.setAlpha(0);

    this.tweens.add({
      targets: startMessage,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: subMessage,
      alpha: 1,
      duration: 800,
      delay: 300
    });

    // Remover mensajes después de 3 segundos
    this.time.delayedCall(3000, () => {
      startMessage.destroy();
      subMessage.destroy();
    });

    // Comenzar a generar piezas
    this.pieceTimer = this.time.addEvent({
      delay: 3500, // Intervalo inicial más lento
      callback: this.generatePiece,
      callbackScope: this,
      loop: true
    });

    // Acelerar generación gradualmente
    this.time.delayedCall(20000, () => {
      if (this.pieceTimer && !this.gameWon && !this.gameLost) {
        this.pieceTimer.delay = 3000;
      }
    });

    this.time.delayedCall(40000, () => {
      if (this.pieceTimer && !this.gameWon && !this.gameLost) {
        this.pieceTimer.delay = 2500;
      }
    });

    this.time.delayedCall(60000, () => {
      if (this.pieceTimer && !this.gameWon && !this.gameLost) {
        this.pieceTimer.delay = 2000;
      }
    });

    this.time.delayedCall(80000, () => {
      if (this.pieceTimer && !this.gameWon && !this.gameLost) {
        this.pieceTimer.delay = 1800;
      }
    });
  }

  generatePiece() {
    if (this.gameWon || this.gameLost) return;

    const isDefective = Math.random() < 0.3; // 30% probabilidad de defectuosa

    // Crear contenedor para la pieza con efectos
    const pieceContainer = this.add.container(this.screenWidth * 0.08, this.screenHeight * 0.5);

    // Sombra de la pieza ajustada al tamaño más pequeño
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(2, 8, 50, 16);
    pieceContainer.add(shadow);

    // Imagen principal de la pieza - engranaje realista más pequeño
    const pieceScale = Math.min(this.screenWidth/700, this.screenHeight/500, 1.2);
    const piece = this.add.image(0, 0, isDefective ? 'piece_defective' : 'piece_good')
      .setScale(pieceScale);
    pieceContainer.add(piece);

    // Efecto sutil solo para piezas defectuosas
    if (isDefective) {
      // Parpadeo muy sutil para piezas defectuosas
      this.tweens.add({
        targets: piece,
        alpha: 0.8,
        duration: 1500,
        yoyo: true,
        repeat: -1
      });
    }

    // Propiedades del contenedor
    pieceContainer.isDefective = isDefective;
    pieceContainer.detected = false;
    pieceContainer.fixed = false;
    pieceContainer.setData('isDefective', isDefective);

    this.pieces.add(pieceContainer);

    // Animación de entrada con rotación
    pieceContainer.setScale(0.3);
    pieceContainer.setRotation(Math.random() * 0.4 - 0.2);

    this.tweens.add({
      targets: pieceContainer,
      scale: 1,
      duration: 500,
      ease: 'Back.easeOut'
    });

    // Animación de movimiento adaptativa - las piezas se mantienen dentro del área visible
    this.tweens.add({
      targets: pieceContainer,
      x: this.screenWidth * 0.48, // Límite ajustado para evitar que se salgan del área
      duration: 10000, // Duración original restaurada
      ease: 'Linear',
      onComplete: () => {
        if (!pieceContainer.detected) {
          // Pérdida de puntos por no escanear cualquier pieza
          this.score = Math.max(0, this.score - 30);
          if (pieceContainer.isDefective) {
            this.showMessage('⚠️ Pieza defectuosa no detectada (-30 pts)', 0xff8800);
          } else {
            this.showMessage('⚠️ Pieza no escaneada (-30 pts)', 0xff8800);
          }
        }
        pieceContainer.destroy();
      }
    });

    // Variación en la posición Y con movimiento más realista
    this.tweens.add({
      targets: pieceContainer,
      y: this.screenHeight * 0.5 + (Math.random() - 0.5) * this.screenHeight * 0.08,
      duration: 1000,
      ease: 'Sine.easeInOut'
    });

    // Rotación sutil durante el movimiento
    this.tweens.add({
      targets: pieceContainer,
      rotation: pieceContainer.rotation + (Math.random() - 0.5) * 0.3,
      duration: 4000,
      ease: 'Sine.easeInOut'
    });
  }

  useSensor(sensor, sensorPos, statusIndicator) {
    if (this.gameLost || this.gameWon || !this.gameStarted) return;

    // Efecto visual del sensor mejorado
    this.createSensorEffect(sensorPos);

    // Activar indicador del sensor
    statusIndicator.clear();
    statusIndicator.fillStyle(0xff0000);
    statusIndicator.fillCircle(sensorPos.x + 25, sensorPos.y - 25, 6);

    // Restaurar indicador después de un momento
    this.time.delayedCall(1000, () => {
      statusIndicator.clear();
      statusIndicator.fillStyle(0x666666);
      statusIndicator.fillCircle(sensorPos.x + 25, sensorPos.y - 25, 6);
    });

    // Buscar piezas cerca del sensor
    const detectionRange = 80;
    let detectedSomething = false;
    let piecesInRange = [];

    this.pieces.children.entries.forEach(piece => {
      const distance = Phaser.Math.Distance.Between(
        piece.x, piece.y, sensorPos.x, this.screenHeight * 0.5
      );

      if (distance < detectionRange) {
        piecesInRange.push({ piece, distance });
      }
    });

    // Ordenar por distancia (más cerca primero)
    piecesInRange.sort((a, b) => a.distance - b.distance);

    piecesInRange.forEach(({ piece }) => {
      if (!piece.detected) {
        if (piece.isDefective) {
          this.detectDefectivePiece(piece, sensorPos.name);
          detectedSomething = true;
        } else {
          this.scanGoodPiece(piece, sensorPos.name);
          detectedSomething = true;
        }
      }
    });

    if (!detectedSomething) {
      this.showMessage(`${sensorPos.name}: Sin piezas en rango`, 0xff9800);
      this.updateStatus('Espera a que las piezas se acerquen al sensor');
    }
  }

  detectDefectivePiece(piece, sensorName) {
    if (piece.detected) return;

    piece.detected = true;

    // Añadir borde de detección al contenedor
    const detectionBorder = this.add.graphics();
    detectionBorder.lineStyle(4, 0xff0000, 0.8);
    detectionBorder.strokeRoundedRect(-25, -20, 50, 40, 8);
    piece.add(detectionBorder);

    // Efecto de parpadeo para llamar la atención
    this.tweens.add({
      targets: detectionBorder,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        detectionBorder.alpha = 0.8;
      }
    });

    // Efecto de vibración
    this.tweens.add({
      targets: piece,
      x: piece.x + 3,
      duration: 50,
      yoyo: true,
      repeat: 5
    });

    this.showMessage(`${sensorName}: ¡Pieza defectuosa detectada! +100 pts`, 0xff0000);
    this.updateStatus('Haz clic en la pieza defectuosa para repararla');

    // Hacer la pieza clickeable para reparar
    piece.setInteractive(new Phaser.Geom.Rectangle(-25, -20, 50, 40), Phaser.Geom.Rectangle.Contains);
    piece.input.cursor = 'pointer';
    piece.on('pointerdown', () => {
      this.repairPiece(piece);
    });

    // Mantener el movimiento de la pieza después de la detección
    // Las piezas deben continuar moviéndose para poder ser reparadas

    // Incrementar contador de defectuosas detectadas y otorgar puntos
    this.errorsDetected++;
    this.score += 100; // Puntos por detectar pieza defectuosa
    this.updateUI();

    // Verificar si se alcanzó la puntuación objetivo
    this.checkWinCondition();
  }

  scanGoodPiece(piece, sensorName) {
    if (piece.detected) return;

    piece.detected = true;

    // Añadir indicador de pieza buena al contenedor
    const goodIndicator = this.add.graphics();
    goodIndicator.fillStyle(0x00ff00, 0.8);
    goodIndicator.fillCircle(20, -20, 6);
    goodIndicator.lineStyle(2, 0x00aa00, 1);
    goodIndicator.strokeCircle(20, -20, 6);
    piece.add(goodIndicator);

    // Símbolo de check pequeño
    const miniCheck = this.add.graphics();
    miniCheck.lineStyle(2, 0xffffff, 1);
    miniCheck.beginPath();
    miniCheck.moveTo(17, -20);
    miniCheck.lineTo(19, -18);
    miniCheck.lineTo(23, -22);
    miniCheck.strokePath();
    piece.add(miniCheck);

    // Efecto de brillo verde
    const glowEffect = this.add.graphics();
    glowEffect.fillStyle(0x88ff88, 0.3);
    glowEffect.fillCircle(0, 0, 30);
    glowEffect.x = piece.x;
    glowEffect.y = piece.y;

    // Animación del brillo
    this.tweens.add({
      targets: glowEffect,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        glowEffect.destroy();
      }
    });

    // Efecto de confirmación visual en el contenedor
    this.tweens.add({
      targets: piece,
      scaleX: piece.scaleX * 1.1,
      scaleY: piece.scaleY * 1.1,
      duration: 200,
      yoyo: true,
      ease: 'Power2'
    });

    // Las piezas buenas ya no otorgan puntos
    this.consecutiveGoodScans++;

    // Solo mostrar mensaje de verificación sin puntos
    this.showMessage(`${sensorName}: Pieza verificada - OK (sin puntos)`, 0x4caf50);

    this.updateStatus('Continúa escaneando las piezas');

    this.updateUI();

    // Verificar si se alcanzó la puntuación objetivo
    this.checkWinCondition();
  }

  repairPiece(piece) {
    if (!piece || !piece.active || !piece.detected || piece.fixed) return;

    piece.fixed = true;

    // Desactivar interactividad para evitar múltiples clics
    piece.disableInteractive();

    // Efecto de reparación con chispas
    const repairEffect = this.add.graphics();
    repairEffect.fillStyle(0x00ff88, 0.8);
    repairEffect.fillCircle(0, 0, 25);
    repairEffect.x = piece.x;
    repairEffect.y = piece.y;

    // Añadir indicador de reparación al contenedor
    const repairIndicator = this.add.graphics();
    repairIndicator.fillStyle(0x00ff00, 0.9);
    repairIndicator.fillCircle(20, -20, 8);
    repairIndicator.lineStyle(2, 0x00aa00, 1);
    repairIndicator.strokeCircle(20, -20, 8);
    piece.add(repairIndicator);

    // Símbolo de check
    const checkMark = this.add.graphics();
    checkMark.lineStyle(3, 0xffffff, 1);
    checkMark.beginPath();
    checkMark.moveTo(16, -20);
    checkMark.lineTo(19, -17);
    checkMark.lineTo(24, -23);
    checkMark.strokePath();
    piece.add(checkMark);

    // Animación del efecto de reparación
    this.tweens.add({
      targets: repairEffect,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        repairEffect.destroy();
      }
    });

    // Partículas de chispas de soldadura
    for (let i = 0; i < 12; i++) {
      const spark = this.add.graphics();
      spark.fillStyle(0xffff00);
      spark.fillCircle(0, 0, 2);
      spark.x = piece.x + (Math.random() - 0.5) * 20;
      spark.y = piece.y + (Math.random() - 0.5) * 20;

      const angle = Math.random() * Math.PI * 2;
      const distance = 30 + Math.random() * 40;

      this.tweens.add({
        targets: spark,
        x: spark.x + Math.cos(angle) * distance,
        y: spark.y + Math.sin(angle) * distance,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 1000 + Math.random() * 500,
        ease: 'Power2',
        onComplete: () => {
          spark.destroy();
        }
      });
    }

    // Cambiar el color de la base metálica a verde
    const metalBase = piece.list[1]; // La base metálica es el segundo elemento
    if (metalBase) {
      metalBase.clear();
      metalBase.fillStyle(0x90ee90, 1);
      metalBase.fillRoundedRect(-20, -15, 40, 30, 5);
      metalBase.lineStyle(2, 0x228b22, 1);
      metalBase.strokeRoundedRect(-20, -15, 40, 30, 5);
    }

    // Cambiar la imagen de la pieza a buena
    const pieceImage = piece.list[3]; // La imagen es el cuarto elemento
    if (pieceImage) {
      pieceImage.setTexture('piece_good');
      pieceImage.setTint(0x00ff88);
    }

    // Animación de reparación
    this.tweens.add({
      targets: piece,
      scaleX: 0.7,
      scaleY: 0.7,
      angle: 360,
      duration: 800,
      ease: 'Back.easeOut'
    });

    this.piecesFixed++;
    this.score += 200;

    this.showMessage('¡Pieza reparada exitosamente! +200 pts', 0x4caf50);
    this.updateStatus('Excelente trabajo. Continúa inspeccionando.');

    this.updateUI();
    this.checkWinCondition();

    // Detener el tween original de movimiento para evitar conflictos
    this.tweens.killTweensOf(piece);

    // Continuar movimiento de la pieza reparada hasta el final de la banda
    this.tweens.add({
      targets: piece,
      x: this.screenWidth * 0.5 + 50, // La pieza llega hasta el final de la banda reducida
      duration: Math.max(2000, (this.screenWidth * 0.5 + 50 - piece.x) * 6), // Duración basada en distancia restante
      ease: 'Linear',
      onComplete: () => {
        piece.destroy();
      }
    });
  }

  createSensorEffect(pos) {
    // Efecto visual mejorado cuando se usa el sensor
    const effect = this.add.circle(pos.x, 250, 30, 0x00ffff, 0.6);
    const innerEffect = this.add.circle(pos.x, 250, 15, 0xffffff, 0.8);

    // Animación del efecto principal
    this.tweens.add({
      targets: effect,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        effect.destroy();
      }
    });

    // Animación del efecto interno
    this.tweens.add({
      targets: innerEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => {
        innerEffect.destroy();
      }
    });

    // Efecto de ondas adicionales
    for (let i = 0; i < 3; i++) {
      this.time.delayedCall(i * 200, () => {
        const wave = this.add.circle(pos.x, 250, 20, 0x44ffff, 0.3);
        this.tweens.add({
          targets: wave,
          scaleX: 2.5,
          scaleY: 2.5,
          alpha: 0,
          duration: 600,
          onComplete: () => wave.destroy()
        });
      });
    }
  }

  showMessage(text, color = 0xffffff) {
    if (this.messageText) {
      this.tweens.killTweensOf(this.messageText);
      this.messageText.destroy();
    }

    // Crear fondo para el mensaje al lado izquierdo del sensor de inspección
    const messageBg = this.add.graphics();
    messageBg.fillStyle(0x000000, 0.8);
    messageBg.fillRoundedRect(this.screenWidth * 0.03, this.screenHeight * 0.26, 420, 65, 10);
    messageBg.lineStyle(2, color, 1);
    messageBg.strokeRoundedRect(this.screenWidth * 0.03, this.screenHeight * 0.26, 420, 65, 10);

    this.messageText = this.add.text(this.screenWidth * 0.03 + 210, this.screenHeight * 0.26 + 32.5, text, {
      fontSize: '22px',
      fill: '#' + color.toString(16).padStart(6, '0'),
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: 380 }
    }).setOrigin(0.5);

    // Animación de entrada
    this.messageText.setAlpha(0);
    messageBg.setAlpha(0);

    this.tweens.add({
      targets: [this.messageText, messageBg],
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });

    // Animación de salida después de 3 segundos
    this.time.delayedCall(3000, () => {
      if (this.messageText && messageBg) {
        this.tweens.add({
          targets: [this.messageText, messageBg],
          alpha: 0,
          duration: 500,
          ease: 'Power2',
          onComplete: () => {
            if (this.messageText) this.messageText.destroy();
            if (messageBg) messageBg.destroy();
          }
        });
      }
    });
  }

  updateUI() {
    this.scoreText.setText(`⭐ Puntos: ${this.score}`);
    this.progressText.setText(`🎯 Objetivo: ${this.score}/${this.targetScore}`);

    // Cambiar color del progreso según completitud del objetivo
    const objectiveProgress = this.score / this.targetScore;

    if (objectiveProgress >= 1) {
      this.progressText.setFill('#00ff00'); // Verde cuando está completo
    } else if (objectiveProgress >= 0.6) {
      this.progressText.setFill('#ffff00'); // Amarillo cuando está avanzado
    } else {
      this.progressText.setFill('#00ff88'); // Color original
    }
  }

  checkWinCondition() {
    // Verificar si se alcanzó la puntuación objetivo
    if (this.score >= this.targetScore && !this.levelPassed) {
      this.levelPassed = true;
      this.showLevelPassedMessage();
      return;
    }

    if (this.errorsDetected >= this.requiredErrors &&
        this.piecesFixed >= this.requiredFixes &&
        !this.gameWon) {
      this.gameWon = true;

      // Detener generación de piezas
      if (this.pieceTimer) {
        this.pieceTimer.destroy();
      }

      this.showVictory();
    }
  }

  showLevelPassedMessage() {
    // Detener todas las animaciones y timers
    this.tweens.killAll();
    if (this.pieceTimer) this.pieceTimer.destroy();

    // Crear overlay de felicitaciones
    const overlay = this.add.rectangle(this.screenWidth/2, this.screenHeight/2, this.screenWidth, this.screenHeight, 0x000000, 0.8);

    // Panel de felicitaciones (movido hacia arriba)
    const congratsPanel = this.add.graphics();
    congratsPanel.fillStyle(0x1a1a2e, 0.95);
    congratsPanel.fillRoundedRect(this.screenWidth/2 - 250, this.screenHeight/2 - 200, 500, 300, 20);
    congratsPanel.lineStyle(4, 0x00ff88, 1);
    congratsPanel.strokeRoundedRect(this.screenWidth/2 - 250, this.screenHeight/2 - 200, 500, 300, 20);

    // Título de felicitaciones (movido hacia arriba)
    const congratsText = this.add.text(this.screenWidth/2, this.screenHeight/2 - 130, '🎉 ¡FELICITACIONES! 🎉', {
      fontSize: '36px',
      fill: '#00ff88',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5);

    // Mensaje de puntuación objetivo alcanzada (movido hacia arriba)
    const scoreText = this.add.text(this.screenWidth/2, this.screenHeight/2 + 30,
      `¡Has alcanzado la puntuación objetivo!\n\n⭐ Puntuación: ${this.score}/${this.targetScore}\n\n🏆 Pasando al siguiente nivel...`, {
      fontSize: '22px',
      fill: '#ffffff',
      fontWeight: 'bold',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    // Animaciones de entrada
    congratsText.setScale(0);
    scoreText.setAlpha(0);

    this.tweens.add({
      targets: congratsText,
      scale: 1,
      duration: 800,
      ease: 'Back.easeOut'
    });

    this.tweens.add({
      targets: scoreText,
      alpha: 1,
      duration: 600,
      delay: 400
    });

    // Congelar por 4 segundos y luego pasar al siguiente nivel
    this.time.delayedCall(4000, () => {
      this.scene.start('scenaVideo4');
    });
  }

  showVictory() {
    this.gameWon = true;

    // Detener todas las animaciones y timers
    this.tweens.killAll();
    if (this.pieceTimer) this.pieceTimer.destroy();

    // Crear overlay de victoria con efecto gradual
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0);
    this.tweens.add({
      targets: overlay,
      alpha: 0.9,
      duration: 1000,
      ease: 'Power2'
    });

    // Panel de victoria
    const victoryPanel = this.add.graphics();
    victoryPanel.fillStyle(0x1a1a2e, 0.95);
    victoryPanel.fillRoundedRect(150, 150, 500, 300, 20);
    victoryPanel.lineStyle(4, 0x00ff88, 1);
    victoryPanel.strokeRoundedRect(150, 150, 500, 300, 20);

    // Título de victoria con efecto
    const victoryText = this.add.text(400, 200, '🎉 ¡INSPECCIÓN COMPLETADA! 🎉', {
      fontSize: '36px',
      fill: '#00ff88',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    // Estadísticas detalladas
    const statsText = this.add.text(400, 260,
      `⭐ Puntuación Final: ${this.score}\n` +
      `🔍 Errores Detectados: ${this.errorsDetected}\n` +
      `🔧 Piezas Reparadas: ${this.piecesFixed}\n` +
      `\n🏆 ¡Excelente trabajo en el control de calidad!`, {
      fontSize: '22px',
      fill: '#ffffff',
      fontWeight: 'bold',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setAlpha(0);

    const continueText = this.add.text(400, 380, '🚀 Presiona ESPACIO para continuar a la escena final', {
      fontSize: '24px',
      fill: '#ffff00',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    // Animaciones secuenciales
    this.tweens.add({
      targets: victoryText,
      alpha: 1,
      scaleX: 1.1,
      scaleY: 1.1,
      duration: 800,
      ease: 'Back.easeOut',
      delay: 500
    });

    this.tweens.add({
      targets: statsText,
      alpha: 1,
      y: 280,
      duration: 600,
      ease: 'Power2',
      delay: 1000
    });

    this.tweens.add({
      targets: continueText,
      alpha: 1,
      duration: 500,
      delay: 1500,
      onComplete: () => {
        // Efecto de parpadeo para el texto de continuar
        this.tweens.add({
          targets: continueText,
          alpha: 0.3,
          duration: 800,
          yoyo: true,
          repeat: -1
        });
      }
    });

    // Continuar al siguiente nivel
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('scenaVideo4');
    });
  }

  gameOver(reason) {
    this.gameLost = true;

    // Detener todas las animaciones y timers
    this.tweens.killAll();
    if (this.pieceTimer) this.pieceTimer.destroy();

    // Crear overlay de derrota con efecto gradual
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0);
    this.tweens.add({
      targets: overlay,
      alpha: 0.85,
      duration: 800,
      ease: 'Power2'
    });

    // Panel de derrota
    const gameOverPanel = this.add.graphics();
    gameOverPanel.fillStyle(0x2e1a1a, 0.95);
    gameOverPanel.fillRoundedRect(150, 150, 500, 300, 20);
    gameOverPanel.lineStyle(4, 0xff4444, 1);
    gameOverPanel.strokeRoundedRect(150, 150, 500, 300, 20);

    // Título de derrota con efecto
    const gameOverText = this.add.text(400, 200, '❌ CONTROL DE CALIDAD FALLIDO', {
      fontSize: '34px',
      fill: '#ff4444',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
      align: 'center'
    }).setOrigin(0.5).setAlpha(0);

    // Razón del fallo
    const reasonText = this.add.text(400, 250, reason, {
      fontSize: '24px',
      fill: '#ffffff',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: 400 }
    }).setOrigin(0.5).setAlpha(0);

    // Estadísticas actuales
    const statsText = this.add.text(400, 300,
      `📊 Progreso actual:\n` +
      `🔍 Errores detectados: ${this.errorsDetected}/${this.requiredErrors}\n` +
      `🔧 Piezas reparadas: ${this.piecesFixed}/${this.requiredFixes}\n` +
      `⭐ Puntuación: ${this.score}`, {
      fontSize: '18px',
      fill: '#cccccc',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5).setAlpha(0);

    // Botones de acción
    const retryBtn = this.add.text(320, 380, '🔄 REINTENTAR', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#ff4444',
      padding: { x: 15, y: 8 },
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive().setAlpha(0);

    const menuBtn = this.add.text(480, 380, '🏠 MENÚ PRINCIPAL', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#666666',
      padding: { x: 15, y: 8 },
      fontWeight: 'bold'
    }).setOrigin(0.5).setInteractive().setAlpha(0);

    // Animaciones secuenciales
    this.tweens.add({
      targets: gameOverText,
      alpha: 1,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 600,
      ease: 'Back.easeOut',
      delay: 400
    });

    this.tweens.add({
      targets: reasonText,
      alpha: 1,
      duration: 500,
      delay: 800
    });

    this.tweens.add({
      targets: statsText,
      alpha: 1,
      duration: 500,
      delay: 1200
    });

    this.tweens.add({
      targets: [retryBtn, menuBtn],
      alpha: 1,
      y: 380,
      duration: 400,
      ease: 'Power2',
      delay: 1600
    });

    // Eventos de los botones
    retryBtn.on('pointerdown', () => {
      this.scene.restart();
    });

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuPrincipal'); // Asumiendo que existe esta escena
    });

    // Efectos hover
    retryBtn.on('pointerover', () => {
      retryBtn.setTint(0xcccccc);
      retryBtn.setScale(1.05);
    });
    retryBtn.on('pointerout', () => {
      retryBtn.clearTint();
      retryBtn.setScale(1);
    });

    menuBtn.on('pointerover', () => {
      menuBtn.setTint(0xcccccc);
      menuBtn.setScale(1.05);
    });
    menuBtn.on('pointerout', () => {
      menuBtn.clearTint();
      menuBtn.setScale(1);
    });
  }

  update() {
    // Solo actualizar si el juego está activo
    if (!this.gameStarted || this.gameWon || this.gameLost) return;

    // Actualizar UI continuamente
    this.updateUI();

    // Limpiar piezas que salieron de la pantalla
    this.pieces.children.entries.forEach(piece => {
      if (piece.x > this.screenWidth * 0.50) { // Límite ajustado para coincidir con el área visible
        // Si una pieza defectuosa sale sin ser detectada, penalizar
        if (piece.isDefective && !piece.detected) {
          this.score = Math.max(0, this.score - 50);
          this.showMessage('⚠️ Pieza defectuosa no detectada (-50 pts)', 0xff8800);
        }
        piece.destroy();
      }
    });

    // Verificar condiciones de juego
    this.checkWinCondition();
  }
}