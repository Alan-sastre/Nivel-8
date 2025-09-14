class scenaFallos extends Phaser.Scene {
  constructor() {
    super({ key: "scenaFallos" });
    this.gamePhase = 'calibration';
    this.calibrationComplete = false;
    this.programmingComplete = false;
    this.assemblyComplete = false;
    this.score = 0;
    this.timeLeft = 180; // 3 minutos
    this.gameTimer = null;
    this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Configuración del juego más desafiante
    this.targetPrecision = 0.258; // mm - precisión ultra alta
    this.currentPrecision = Math.round((0.3 + Math.random() * 0.2) * 1000) / 1000; // mm inicial aleatorio (0.3-0.5mm) lejos del objetivo, redondeado
    this.robotPrograms = [];
    this.assembledParts = 0;
    this.targetParts = 15; // más piezas
    this.defectivePartsFound = 0;
    this.targetDefects = 10; // más defectos
    this.targetTemp = 185; // °C objetivo nuevo
    this.currentTemp = Math.floor(160 + Math.random() * 15); // °C inicial aleatorio (160-174°C) lejos del objetivo, sin decimales
    this.temperatureStable = Math.abs(this.currentTemp - this.targetTemp) < 5; // Calcular estado inicial

    // Nuevas mecánicas de juego
    this.difficultyLevel = 1;
    this.maxDifficultyLevel = 3;
    this.programmingErrors = 0;
    this.maxAllowedErrors = 3;
    this.sequenceComplexity = 4; // comandos mínimos requeridos
    this.timeBonus = 0;
    this.perfectCalibrations = 0;
    this.requiredSequences = [
      ['MOVER_X', 'ROTAR', 'AGARRAR', 'MOVER_Y', 'SOLTAR'],
      ['INICIALIZAR', 'MOVER_Z', 'ROTAR', 'AGARRAR', 'MOVER_X', 'ROTAR', 'SOLTAR'],
      ['CALIBRAR', 'MOVER_X', 'MOVER_Y', 'ROTAR', 'AGARRAR', 'MOVER_Z', 'ROTAR', 'SOLTAR', 'VERIFICAR']
    ];
    this.currentSequenceIndex = 0;

    // Pregunta final
    this.correctOption = 1;
    this.options = [
      "Una regla de medición común",
      "Un calibrador digital (pie de rey o micrómetro)",
      "Un sensor de temperatura",
      "Un osciloscopio"
    ];

    this.feedbackTexts = [
      "Revisa las herramientas de medición utilizadas en ingeniería de precisión.",
      "¡Correcto! Un calibrador digital permite medir con alta precisión y verificar si las piezas cumplen con las dimensiones necesarias.",
      "Revisa las herramientas de medición utilizadas en ingeniería de precisión.",
      "Revisa las herramientas de medición utilizadas en ingeniería de precisión."
    ];

    // Partículas y efectos
    this.particles = [];
    this.sparks = [];

    // Estados de las 3 palancas principales
    this.mainLeverStates = [false, false, false];
  }

  preload() {
    this.load.image("factory_bg", "assets/scenaPrincipal/1.jpg");
    this.load.image('impresora3d', 'assets/Fallos/1.png');
    this.load.image('brazo_robotico', 'assets/Fallos/2.png');
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo industrial mejorado
    this.createAdvancedIndustrialBackground();

    // UI Principal
    this.createMainUI();

    // Efectos de partículas
    // Efectos de partículas deshabilitados para mejor rendimiento

    // Iniciar con la fase de calibración
    this.startCalibrationPhase();


  }

  createAdvancedIndustrialBackground() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Fondo animado con gradiente dinámico
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a1a, 0x1a1a2e, 0x16213e, 0x0f3460, 1);
    bg.fillRect(0, 0, width, height);

    // Crear partículas flotantes animadas
    this.backgroundParticles = [];
    for (let i = 0; i < 30; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0x4a90e2, 0.3 + Math.random() * 0.4);
      particle.fillCircle(0, 0, 1 + Math.random() * 2);
      particle.x = Math.random() * width;
      particle.y = Math.random() * height;
      particle.speedX = (Math.random() - 0.5) * 0.5;
      particle.speedY = (Math.random() - 0.5) * 0.5;
      particle.pulseSpeed = 0.02 + Math.random() * 0.03;
      particle.pulsePhase = Math.random() * Math.PI * 2;
      this.backgroundParticles.push(particle);
    }

    // Líneas de energía animadas
    this.energyLines = [];
    for (let i = 0; i < 8; i++) {
      const line = this.add.graphics();
      line.lineStyle(1, 0x00ff88, 0.4);
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const endX = Math.random() * width;
      const endY = Math.random() * height;
      line.moveTo(startX, startY);
      line.lineTo(endX, endY);
      line.stroke();
      line.alpha = 0;
      line.animPhase = Math.random() * Math.PI * 2;
      line.animSpeed = 0.01 + Math.random() * 0.02;
      this.energyLines.push(line);
    }

    // Patrón de puntos con brillo pulsante
    this.glowDots = [];
    for (let x = 40; x < width; x += 80) {
      for (let y = 40; y < height; y += 80) {
        const dot = this.add.graphics();
        dot.fillStyle(0x4a90e2, 0.6);
        dot.fillCircle(x, y, 2);
        dot.pulsePhase = Math.random() * Math.PI * 2;
        dot.pulseSpeed = 0.015 + Math.random() * 0.01;
        this.glowDots.push(dot);
      }
    }

    // Elementos decorativos con efectos de brillo
    const decorElements = this.add.graphics();
    decorElements.lineStyle(2, 0x00ccff, 0.8);

    // Líneas decorativas animadas en las esquinas
    decorElements.moveTo(0, 0);
    decorElements.lineTo(120, 0);
    decorElements.lineTo(120, 120);

    decorElements.moveTo(width, 0);
    decorElements.lineTo(width - 120, 0);
    decorElements.lineTo(width - 120, 120);

    decorElements.moveTo(0, height);
    decorElements.lineTo(120, height);
    decorElements.lineTo(120, height - 120);

    decorElements.moveTo(width, height);
    decorElements.lineTo(width - 120, height);
    decorElements.lineTo(width - 120, height - 120);

    decorElements.stroke();

    // Crear ondas de energía expansivas
    this.energyWaves = [];
    this.createEnergyWave();
    
    // Crear chispas ocasionales
    this.sparks = [];
    this.createRandomSparks();
    
    // Iniciar animaciones del fondo
    this.startBackgroundAnimations();
  }

  createEnergyWave() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    const wave = this.add.graphics();
    wave.lineStyle(2, 0x00ffff, 0.6);
    wave.strokeCircle(centerX, centerY, 10);
    wave.scale = 0.1;
    wave.alpha = 0.8;
    
    this.energyWaves.push(wave);
    
    // Crear nueva onda cada 3 segundos
    this.time.delayedCall(3000, () => {
      this.createEnergyWave();
    });
  }
  
  createRandomSparks() {
    // Crear chispas aleatorias cada 2-4 segundos
    const delay = 2000 + Math.random() * 2000;
    
    this.time.delayedCall(delay, () => {
      const spark = this.add.graphics();
      spark.fillStyle(0xffff00, 0.8);
      spark.fillCircle(0, 0, 3);
      spark.x = Math.random() * this.cameras.main.width;
      spark.y = Math.random() * this.cameras.main.height;
      spark.scaleX = 0.5 + Math.random() * 0.5;
      spark.scaleY = 0.5 + Math.random() * 0.5;
      
      this.sparks.push(spark);
      
      // Desvanecer chispa
      this.tweens.add({
        targets: spark,
        alpha: 0,
        scaleX: 0,
        scaleY: 0,
        duration: 1000,
        onComplete: () => {
          spark.destroy();
          const index = this.sparks.indexOf(spark);
          if (index > -1) this.sparks.splice(index, 1);
        }
      });
      
      this.createRandomSparks();
    });
  }

  startBackgroundAnimations() {
    // Animar partículas flotantes
    this.time.addEvent({
      delay: 16, // ~60 FPS
      callback: () => {
        this.backgroundParticles.forEach(particle => {
          // Movimiento flotante
          particle.x += particle.speedX;
          particle.y += particle.speedY;
          
          // Rebote en los bordes
          if (particle.x < 0 || particle.x > this.cameras.main.width) {
            particle.speedX *= -1;
          }
          if (particle.y < 0 || particle.y > this.cameras.main.height) {
            particle.speedY *= -1;
          }
          
          // Efecto de pulsación
          particle.pulsePhase += particle.pulseSpeed;
          const pulseAlpha = 0.3 + Math.sin(particle.pulsePhase) * 0.3;
          particle.alpha = pulseAlpha;
        });
        
        // Animar líneas de energía
        this.energyLines.forEach(line => {
          line.animPhase += line.animSpeed;
          const alpha = (Math.sin(line.animPhase) + 1) * 0.3;
          line.alpha = alpha;
        });
        
        // Animar puntos brillantes
        this.glowDots.forEach(dot => {
          dot.pulsePhase += dot.pulseSpeed;
          const scale = 1 + Math.sin(dot.pulsePhase) * 0.3;
          dot.setScale(scale);
          const alpha = 0.4 + Math.sin(dot.pulsePhase) * 0.4;
          dot.alpha = alpha;
        });
        
        // Animar ondas de energía
        this.energyWaves.forEach((wave, index) => {
          wave.scale += 0.02;
          wave.alpha -= 0.005;
          
          if (wave.alpha <= 0) {
            wave.destroy();
            this.energyWaves.splice(index, 1);
          }
        });
      },
      loop: true
    });
  }

  createParticleEffects() {
    // Sistema de partículas para humo/vapor
    this.smokeParticles = this.add.particles(0, 0, 'factory_bg', {
      scale: { start: 0.1, end: 0.3 },
      alpha: { start: 0.6, end: 0 },
      speed: { min: 20, max: 50 },
      lifespan: 3000,
      frequency: 200,
      tint: 0x666666
    });

    // Chispas ocasionales
    this.sparkParticles = this.add.particles(0, 0, 'factory_bg', {
      scale: { start: 0.05, end: 0.01 },
      alpha: { start: 1, end: 0 },
      speed: { min: 100, max: 200 },
      lifespan: 800,
      frequency: 1000,
      tint: 0xffaa00
    });
  }

  createMainUI() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Header moderno y limpio - más corto
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x1e3a8a, 0.95);
    headerBg.fillRoundedRect(50, 20, width - 100, 70, 15);
    headerBg.lineStyle(2, 0x60a5fa, 1);
    headerBg.strokeRoundedRect(50, 20, width - 100, 70, 15);

    // Título elegante
    this.titleText = this.add.text(width/2, 40, "🏭 SIMULADOR DE FÁBRICA ROBÓTICA", {
      fontSize: "24px",
      fill: "#ffffff",
      fontFamily: "Arial Black",
      align: "center",
      stroke: "#1e3a8a",
      strokeThickness: 1
    }).setOrigin(0.5);

    // Subtítulo
    const subtitle = this.add.text(width/2, 65, "Sistema de Control Industrial Avanzado", {
      fontSize: "14px",
      fill: "#93c5fd",
      fontFamily: "Arial",
      align: "center",
      fontStyle: "italic"
    }).setOrigin(0.5);

    // Mensaje del objetivo movido al lado de la imagen de la impresora
  }

  startCalibrationPhase() {
    this.gamePhase = 'calibration';

    // Limpiar elementos anteriores
    if (this.gameElements) {
      this.gameElements.forEach(element => element.destroy());
    }
    this.gameElements = [];

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const gameWidth = this.cameras.main.width;
    const isMobile = gameWidth < 800;

    // Posiciones adaptativas para móviles - impresora más abajo
    const printerX = isMobile ? centerX : centerX - 150;
    const printerY = isMobile ? centerY - 80 : centerY - 40;
    const objectiveX = isMobile ? centerX : centerX + 150;
    const objectiveY = isMobile ? centerY + 80 : centerY - 40;

    // Impresora 3D industrial mejorada
    this.create3DPrinter(printerX, printerY);

    // Mensaje del objetivo al lado de la imagen
    this.objectiveText = this.add.text(objectiveX, objectiveY,
      "📋 INSTRUCCIONES:\n\n1. PRIMERO: Ajusta la temperatura a 185°C\n2. DESPUÉS: Activa exactamente 2 palancas\ndel panel de control\n", {
      fontSize: isMobile ? "15px" : "17px",
      fill: "#FFFFFF",
      fontFamily: "Verdana",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: isMobile ? 220 : 280 },
      stroke: "#333333",
      strokeThickness: 1,
      backgroundColor: "rgba(44, 62, 80, 0.7)",
      padding: { x: 16, y: 12 },
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2, fill: true }
    }).setOrigin(0.5);
    this.gameElements.push(this.objectiveText);

    // Panel de control avanzado - posición adaptativa
    const panelY = isMobile ? centerY + 200 : centerY + 150;
    this.createAdvancedControlPanel(centerX, panelY);

    this.updateAllDisplays();

    // Verificar si ya está calibrado al inicio
    this.checkCalibrationComplete();
  }

  create3DPrinter(x, y) {
    // Contenedor elegante para la impresora - más grande
    const container = this.add.graphics();
    container.fillStyle(0x1e293b, 0.9);
    container.fillRoundedRect(x - 150, y - 100, 300, 200, 15);
    container.lineStyle(3, 0x60a5fa, 1);
    container.strokeRoundedRect(x - 150, y - 100, 300, 200, 15);

    // Sombra del contenedor
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillRoundedRect(x - 145, y - 95, 300, 200, 15);
    this.gameElements.push(shadow, container);

    // Imagen principal de la impresora 3D - más grande
    const printerImage = this.add.image(x, y + 10, 'impresora3d');
    printerImage.setScale(0.4);
    printerImage.setOrigin(0.5, 0.5);
    this.gameElements.push(printerImage);

    // Texto de estado elegante - posición bajada
    this.printerStatus = this.add.text(x, y + 75, "INICIANDO...", {
      fontSize: "10px",
      fill: "#fbbf24",
      fontFamily: "Arial Bold"
    }).setOrigin(0.5);
    this.gameElements.push(this.printerStatus);

    // Extrusor virtual para efectos - más pequeño
    this.nozzle = this.add.circle(x + 15, y - 15, 2, 0xf59e0b);
    this.nozzle.setStrokeStyle(1, 0xffffff, 0.8);
    this.gameElements.push(this.nozzle);

    // Partículas de vapor
    if (this.smokeParticles && this.nozzle) {
      this.smokeParticles.setPosition(this.nozzle.x, this.nozzle.y - 10);
    }
  }

  createAdvancedControlPanel(x, y) {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const isMobile = width < 800;
    
    // Dimensiones más moderadas del panel
    const panelWidth = isMobile ? width - 60 : Math.min(600, width - 100);
    const panelHeight = isMobile ? 180 : 160;
    const panelX = (width - panelWidth) / 2;
    const panelY = height * 0.62;
    
    // Crear el recuadro principal del Panel de Control (mucho más grande)
    const panel = this.add.graphics();
    panel.fillStyle(0x0f1419, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
    panel.lineStyle(3, 0x00d4ff, 0.8);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 15);
    this.gameElements.push(panel);

    // Efecto de brillo interno
    const innerGlow = this.add.graphics();
    innerGlow.lineStyle(2, 0x00d4ff, 0.3);
    innerGlow.strokeRoundedRect(panelX + 2, panelY + 2, panelWidth - 4, panelHeight - 4, 12);
    this.gameElements.push(innerGlow);

    // Título del panel más grande
    const title = this.add.text(panelX + panelWidth/2, panelY + 25, 'PANEL DE CONTROL', {
        fontSize: isMobile ? '16px' : '18px',
        fill: '#00d4ff',
        fontFamily: 'Orbitron, Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.gameElements.push(title);

    // Línea divisoria más gruesa
    const divider = this.add.graphics();
    divider.lineStyle(2, 0x00d4ff, 0.5);
    divider.lineBetween(panelX + 20, panelY + 45, panelX + panelWidth - 20, panelY + 45);
    this.gameElements.push(divider);
    
    // Guardar dimensiones del panel para uso en otras secciones
    this.panelDimensions = {
      x: panelX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      isMobile: isMobile
    };

    // Sección izquierda - 3 Palancas
    this.createLeversSection();

    // Sección derecha - Temperatura
    this.createTemperatureSection();
  }

  // Sección de las 3 palancas (lado izquierdo)
  createLeversSection() {
    const { x: panelX, y: panelY, width: panelWidth, height: panelHeight, isMobile } = this.panelDimensions;
    
    // Título de la sección más grande
    const titleY = panelY + (isMobile ? 65 : 60);
    const leversTitle = this.add.text(panelX + panelWidth * 0.25, titleY, 'PALANCAS', {
        fontSize: isMobile ? '14px' : '16px',
        fill: '#00d4ff',
        fontFamily: 'Orbitron, Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.gameElements.push(leversTitle);

    // Crear las 3 palancas con diseño mucho más grande
    const leverSpacing = (panelWidth * 0.4) / 4;
    const startX = panelX + leverSpacing;
    const leverBaseY = panelY + (isMobile ? 110 : 100);
    
    for (let i = 0; i < 3; i++) {
        const leverX = startX + (i * leverSpacing);
        const leverY = leverBaseY;

        // Base de la palanca (panel de control premium)
        const leverBase = this.add.graphics();

        // Sombra de la base
        leverBase.fillStyle(0x000000, 0.4);
        leverBase.fillRoundedRect(leverX - 18, leverY - 23, 40, 50, 8);

        // Base principal con gradiente
        leverBase.fillStyle(0x1a1a2e, 1);
        leverBase.fillRoundedRect(leverX - 20, leverY - 25, 40, 50, 8);

        // Borde exterior brillante
        leverBase.lineStyle(3, 0x00d4ff, 1);
        leverBase.strokeRoundedRect(leverX - 20, leverY - 25, 40, 50, 8);

        // Borde interior para profundidad
        leverBase.lineStyle(1, 0x4a4a6e, 0.8);
        leverBase.strokeRoundedRect(leverX - 18, leverY - 23, 36, 46, 6);

        // Efecto de brillo superior
        leverBase.fillStyle(0xffffff, 0.15);
        leverBase.fillRoundedRect(leverX - 18, leverY - 23, 36, 12, 6);

        // Añadir al array de elementos del juego
        this.gameElements.push(leverBase);

        // Ranura de la palanca con profundidad
        const leverSlot = this.add.graphics();

        // Sombra interna de la ranura
        leverSlot.fillStyle(0x000000, 0.9);
        leverSlot.fillRoundedRect(leverX - 4, leverY - 16, 8, 32, 4);

        // Ranura principal
        leverSlot.fillStyle(0x0a0a0a, 1);
        leverSlot.fillRoundedRect(leverX - 3, leverY - 15, 6, 30, 3);

        // Borde de la ranura
        leverSlot.lineStyle(1, 0x333333, 1);
        leverSlot.strokeRoundedRect(leverX - 3, leverY - 15, 6, 30, 3);

        // Efecto de profundidad interior
        leverSlot.lineStyle(1, 0x666666, 0.3);
        leverSlot.strokeRoundedRect(leverX - 2, leverY - 14, 4, 28, 2);

        // Añadir al array de elementos del juego
        this.gameElements.push(leverSlot);

        // Mango de la palanca (inicialmente en posición OFF - abajo)
        const leverHandle = this.add.graphics();
        this.gameElements.push(leverHandle);
        let isOn = false; // Estado inicial

        // Función para dibujar el mango premium
        const drawHandle = (state) => {
            leverHandle.clear();
            const handleY = state ? leverY - 8 : leverY + 8;

            // Sombra del mango
            leverHandle.fillStyle(0x000000, 0.4);
            leverHandle.fillCircle(leverX + 1, handleY + 1, 9);

            // Base del mango con gradiente
            leverHandle.fillStyle(state ? 0x2a9d8f : 0x999999, 1);
            leverHandle.fillCircle(leverX, handleY, 9);

            // Círculo principal del mango
            leverHandle.fillStyle(state ? 0x4ecdc4 : 0xcccccc, 1);
            leverHandle.fillCircle(leverX, handleY, 8);

            // Borde del mango
            leverHandle.lineStyle(2, state ? 0x26a69a : 0x888888, 1);
            leverHandle.strokeCircle(leverX, handleY, 8);

            // Brillo principal
            leverHandle.fillStyle(0xffffff, state ? 0.4 : 0.3);
            leverHandle.fillCircle(leverX - 2, handleY - 2, 3);

            // Brillo secundario
            leverHandle.fillStyle(0xffffff, 0.2);
            leverHandle.fillCircle(leverX + 2, handleY - 1, 2);

            // Textura del mango
            leverHandle.lineStyle(1, state ? 0x6ee7e0 : 0xe0e0e0, 0.5);
            leverHandle.strokeCircle(leverX, handleY, 5);
        };

        // Dibujar estado inicial
        drawHandle(isOn);

        // Indicador LED premium
        const ledIndicator = this.add.graphics();
        this.gameElements.push(ledIndicator);

        // Función para dibujar LED mejorado
        const drawLED = (state) => {
            ledIndicator.clear();

            // Halo del LED (solo cuando está encendido)
            if (state) {
                ledIndicator.fillStyle(0x00ff00, 0.2);
                ledIndicator.fillCircle(leverX + 15, leverY - 20, 8);
                ledIndicator.fillStyle(0x00ff00, 0.1);
                ledIndicator.fillCircle(leverX + 15, leverY - 20, 12);
            }

            // Base del LED
            ledIndicator.fillStyle(0x333333, 1);
            ledIndicator.fillCircle(leverX + 15, leverY - 20, 5);

            // LED principal
            ledIndicator.fillStyle(state ? 0x00ff00 : 0xff0000, 1);
            ledIndicator.fillCircle(leverX + 15, leverY - 20, 4);

            // Borde del LED
            ledIndicator.lineStyle(1, 0xffffff, 0.9);
            ledIndicator.strokeCircle(leverX + 15, leverY - 20, 4);

            // Brillo del LED
            ledIndicator.fillStyle(0xffffff, state ? 0.6 : 0.3);
            ledIndicator.fillCircle(leverX + 13, leverY - 22, 2);
        };

        // Dibujar LED inicial
        drawLED(isOn);

        // Etiqueta eliminada según solicitud del usuario

        // Estado de la palanca (ON/OFF)
        const leverState = this.add.text(leverX, leverY + 30, 'OFF', {
            fontSize: '9px',
            fill: '#ff6b6b',
            fontFamily: 'Orbitron, Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.gameElements.push(leverState);

        // Hacer la palanca interactiva
        const leverArea = this.add.rectangle(leverX, leverY, 40, 50, 0x000000, 0);
        leverArea.setInteractive({ cursor: 'pointer' });
        this.gameElements.push(leverArea);
        leverArea.on('pointerdown', () => {
            // Verificar si la temperatura es correcta primero
            const temperatureOK = this.currentTemp === 185;

            // Si la temperatura no es correcta, mostrar mensaje y bloquear palancas
            if (!temperatureOK) {
                // Mostrar mensaje de error de temperatura
                this.showTemperatureRequiredMessage();
                return; // No permitir cambiar palancas
            }

            // Verificar si se puede activar la palanca
            const currentActiveCount = this.mainLeverStates.filter(state => state).length;

            // Si la palanca está apagada y ya hay 2 activas, no permitir activarla
            if (!isOn && currentActiveCount >= 2) {
                // Mostrar mensaje de error
                this.showLeverError();
                return; // No hacer nada más
            }

            // Toggle del estado de la palanca
            isOn = !isOn;

            // Actualizar el estado en el array principal
            this.mainLeverStates[i] = isOn;

            console.log(`🔧 PALANCA ${i} CAMBIADA:`, isOn);
            console.log(`🔧 ESTADOS ACTUALES:`, this.mainLeverStates);
            console.log(`🔧 TEMPERATURA ACTUAL:`, this.currentTemp);

            // Verificar si se cumplen las condiciones de calibración
            const scene = this;
            scene.checkCalibrationComplete();

            // Redibujar el mango en la nueva posición
            drawHandle(isOn);

            // Actualizar LED con nueva función
             drawLED(isOn);

            // Actualizar texto y colores
            leverState.setText(isOn ? 'ON' : 'OFF');
            leverState.setColor(isOn ? '#4ecdc4' : '#ff6b6b');

            // Redibujar base con efectos mejorados
             leverBase.clear();

             // Sombra de la base
             leverBase.fillStyle(0x000000, 0.4);
             leverBase.fillRoundedRect(leverX - 18, leverY - 23, 40, 50, 8);

             // Base principal con color dinámico
             leverBase.fillStyle(isOn ? 0x1a2e1a : 0x1a1a2e, 1);
             leverBase.fillRoundedRect(leverX - 20, leverY - 25, 40, 50, 8);

             // Borde exterior brillante
             leverBase.lineStyle(3, isOn ? 0x4ecdc4 : 0x00d4ff, 1);
             leverBase.strokeRoundedRect(leverX - 20, leverY - 25, 40, 50, 8);

             // Borde interior para profundidad
             leverBase.lineStyle(1, isOn ? 0x6e8a6e : 0x4a4a6e, 0.8);
             leverBase.strokeRoundedRect(leverX - 18, leverY - 23, 36, 46, 6);

             // Efecto de brillo superior
             leverBase.fillStyle(0xffffff, isOn ? 0.2 : 0.15);
             leverBase.fillRoundedRect(leverX - 18, leverY - 23, 36, 12, 6);

             // Redibujar la ranura con efectos mejorados
             leverSlot.clear();

             // Sombra interna de la ranura
             leverSlot.fillStyle(0x000000, 0.9);
             leverSlot.fillRoundedRect(leverX - 4, leverY - 16, 8, 32, 4);

             // Ranura principal
             leverSlot.fillStyle(0x0a0a0a, 1);
             leverSlot.fillRoundedRect(leverX - 3, leverY - 15, 6, 30, 3);

             // Borde de la ranura
             leverSlot.lineStyle(1, 0x333333, 1);
             leverSlot.strokeRoundedRect(leverX - 3, leverY - 15, 6, 30, 3);

             // Efecto de profundidad interior
             leverSlot.lineStyle(1, 0x666666, 0.3);
             leverSlot.strokeRoundedRect(leverX - 2, leverY - 14, 4, 28, 2);

            // Efecto de sonido visual (parpadeo rápido)
             leverBase.setAlpha(0.7);
             this.time.delayedCall(100, () => leverBase.setAlpha(1));

             // Efecto de pulsación en LED cuando está encendido
             if (isOn) {
                 this.tweens.add({
                     targets: ledIndicator,
                     scaleX: 1.2,
                     scaleY: 1.2,
                     duration: 150,
                     yoyo: true,
                     ease: 'Power2'
                 });
             }
        });
    }
  }

  // Sección de temperatura (lado derecho)
  createTemperatureSection() {
    // Título de la sección (movido a la derecha)
    const tempTitle = this.add.text(520, 370, 'TEMPERATURA', {
        fontSize: '12px',
        fill: '#00d4ff',
        fontFamily: 'Orbitron, Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.gameElements.push(tempTitle);

    // Fondo de la sección de temperatura eliminado

    // Display de temperatura actual (movido a la derecha)
    const currentTempValue = this.add.text(490, 408, `${this.currentTemp}°C`, {
        fontSize: '14px',
        fill: '#ff9f43',
        fontFamily: 'Orbitron, Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.gameElements.push(currentTempValue);

    // Etiqueta para temperatura actual (movida a la derecha)
    const currentLabel = this.add.text(490, 395, 'ACTUAL', {
        fontSize: '8px',
        fill: '#ffffff',
        fontFamily: 'Orbitron, Arial'
    }).setOrigin(0.5);
    this.gameElements.push(currentLabel);

    // Display de temperatura objetivo (movido a la derecha)
    const targetTempValue = this.add.text(550, 408, `${this.targetTemp}°C`, {
        fontSize: '14px',
        fill: '#4ecdc4',
        fontFamily: 'Orbitron, Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.gameElements.push(targetTempValue);

    // Etiqueta para temperatura objetivo (movida a la derecha)
    const targetLabel = this.add.text(550, 395, 'OBJETIVO', {
        fontSize: '8px',
        fill: '#ffffff',
        fontFamily: 'Orbitron, Arial'
    }).setOrigin(0.5);
    this.gameElements.push(targetLabel);

    // Botones de control de temperatura más grandes (movidos a la derecha)
    const tempUpBtn = this.add.graphics();
    tempUpBtn.fillStyle(0x2d5a87, 0.9);
    tempUpBtn.fillRoundedRect(470, 425, 35, 25, 6);
    tempUpBtn.lineStyle(3, 0x4ecdc4, 0.8);
    tempUpBtn.strokeRoundedRect(470, 425, 35, 25, 6);
    this.gameElements.push(tempUpBtn);

    const tempUpText = this.add.text(487.5, 437.5, '▲', {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.gameElements.push(tempUpText);

    const tempDownBtn = this.add.graphics();
    tempDownBtn.fillStyle(0x87322d, 0.9);
    tempDownBtn.fillRoundedRect(515, 425, 35, 25, 6);
    tempDownBtn.lineStyle(3, 0xff6b6b, 0.8);
    tempDownBtn.strokeRoundedRect(515, 425, 35, 25, 6);
    this.gameElements.push(tempDownBtn);

    const tempDownText = this.add.text(532.5, 437.5, '▼', {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    }).setOrigin(0.5);
    this.gameElements.push(tempDownText);

    // Hacer los botones interactivos con áreas más grandes (movidos a la derecha)
    const upArea = this.add.rectangle(487.5, 437.5, 35, 25, 0x000000, 0);
    upArea.setInteractive({ cursor: 'pointer' });
    upArea.on('pointerdown', () => {
        this.currentTemp = Math.min(this.currentTemp + 1, 250);
        currentTempValue.setText(`${this.currentTemp}°C`);
        // Efecto visual al presionar
        tempUpBtn.setAlpha(0.7);
        this.time.delayedCall(100, () => tempUpBtn.setAlpha(1));
    });
    this.gameElements.push(upArea);

    const downArea = this.add.rectangle(532.5, 437.5, 35, 25, 0x000000, 0);
    downArea.setInteractive({ cursor: 'pointer' });
    downArea.on('pointerdown', () => {
        this.currentTemp = Math.max(this.currentTemp - 1, 0);
        currentTempValue.setText(`${this.currentTemp}°C`);
        // Efecto visual al presionar
        tempDownBtn.setAlpha(0.7);
        this.time.delayedCall(100, () => tempDownBtn.setAlpha(1));
    });
    this.gameElements.push(downArea);
  }

  // Función obsoleta eliminada - se usa createBasicControls
  createModernSystemMeters(x, y) {
    // Función vacía para evitar errores

    // Borde interior brillante
    sectionBg.lineStyle(1, 0x8b5cf6, 0.6);
    sectionBg.strokeRoundedRect(x - 198, y - 28, 396, 76, 10);
    this.gameElements.push(sectionBg);

    // Título de la sección
    const sectionTitle = this.add.text(x, y - 15, "MONITOREO DEL SISTEMA", {
      fontSize: "14px",
      fill: "#8b5cf6",
      fontFamily: "Arial Bold",
      stroke: "#000000",
      strokeThickness: 1
    }).setOrigin(0.5);
    this.gameElements.push(sectionTitle);

    // Medidores de rendimiento
    const meters = [
      { label: "CPU", value: 45, color: 0x10b981, x: x - 120 },
      { label: "RAM", value: 67, color: 0xf59e0b, x: x - 40 },
      { label: "TEMP", value: 32, color: 0xef4444, x: x + 40 },
      { label: "PWR", value: 89, color: 0x06b6d4, x: x + 120 }
    ];

    meters.forEach(meter => {
      this.drawModernMeter(meter.x, y + 15, meter.label, meter.value, meter.color);
    });
  }

  createSystemStatusIndicators(x, y) {
    // Indicadores de estado en tiempo real
    const indicators = [
      { label: "CONEXIÓN", status: true, x: x - 100 },
      { label: "CALIBRADO", status: false, x: x },
      { label: "OPERATIVO", status: false, x: x + 100 }
    ];

    indicators.forEach(indicator => {
      const statusLight = this.add.graphics();
      this.drawStatusIndicator(statusLight, indicator.x, y, indicator.status);
      this.gameElements.push(statusLight);

      const statusLabel = this.add.text(indicator.x, y + 15, indicator.label, {
        fontSize: "10px",
        fill: "#94a3b8",
        fontFamily: "Arial Bold"
      }).setOrigin(0.5);
      this.gameElements.push(statusLabel);
    });
  }

  // Función duplicada eliminada - se usa createModernPrecisionControls

  drawBasicSwitch(graphics, x, y, isOn, color) {
    graphics.clear();

    // Base del switch con gradiente
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRoundedRect(x - 22, y - 12, 44, 24, 8);

    // Switch principal con efecto 3D
    if (isOn) {
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(x - 18, y - 8, 36, 16, 6);

      // Brillo superior
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillRoundedRect(x - 18, y - 8, 36, 6, 6);
    } else {
      graphics.fillStyle(0x475569, 1);
      graphics.fillRoundedRect(x - 18, y - 8, 36, 16, 6);

      // Sombra interior
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillRoundedRect(x - 18, y - 8, 36, 4, 6);
    }

    // Borde brillante del switch
    graphics.lineStyle(2, isOn ? 0x60a5fa : 0x64748b, 0.8);
    graphics.strokeRoundedRect(x - 22, y - 12, 44, 24, 8);
  }

  // Función obsoleta eliminada - se usa drawBasicSwitch

  drawBasicLED(graphics, x, y, isOn, color) {
    graphics.clear();

    // Base metálica del LED
    graphics.fillStyle(0x374151, 1);
    graphics.fillCircle(x, y, 12);

    // LED principal
    if (isOn) {
      // Efecto de brillo exterior
      graphics.fillStyle(color, 0.3);
      graphics.fillCircle(x, y, 15);

      // LED principal brillante
      graphics.fillStyle(color, 1);
      graphics.fillCircle(x, y, 9);

      // Brillo central
      graphics.fillStyle(0xffffff, 0.6);
      graphics.fillCircle(x - 2, y - 2, 4);
    } else {
      // LED apagado
      graphics.fillStyle(0x1f2937, 1);
      graphics.fillCircle(x, y, 9);

      // Reflejo sutil
      graphics.fillStyle(0x4b5563, 0.4);
      graphics.fillCircle(x - 2, y - 2, 3);
    }

    // Borde metálico
    graphics.lineStyle(2, 0x6b7280, 0.8);
    graphics.strokeCircle(x, y, 12);
  }

  // Funciones obsoletas eliminadas - se usan drawBasicLED y funciones básicas

  toggleBasicSwitch(index) {
    this.switchStates[index] = !this.switchStates[index];
    const isOn = this.switchStates[index];

    // Actualizar visual del switch con nuevas coordenadas
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const switchX = centerX - 120 + (index * 120);
    const switchY = centerY + 60;

    this.drawBasicSwitch(this.switches[index], switchX, switchY, isOn, 0x00ff00);
    this.drawBasicLED(this.bulbs[index], switchX, switchY + 35, isOn, 0x00ff00);

    // Restaurar interactividad
    this.switches[index].setInteractive(new Phaser.Geom.Rectangle(switchX - 20, switchY - 10, 40, 20), Phaser.Geom.Rectangle.Contains);

    // Actualizar estado del sistema
    const activeCount = this.switchStates.filter(state => state).length;

    if (activeCount === 0) {
      this.systemStatus.setText("SISTEMA: INACTIVO");
      this.systemStatus.setFill("#ff0000");
      this.drawStatusLED(this.statusLED, centerX - 120, centerY + 145, false);
    } else if (activeCount === 3) {
      this.systemStatus.setText("SISTEMA: OPERATIVO");
      this.systemStatus.setFill("#00ff00");
      this.drawStatusLED(this.statusLED, centerX - 120, centerY + 145, true);
    } else {
      this.systemStatus.setText(`SISTEMA: PARCIAL (${activeCount}/3)`);
      this.systemStatus.setFill("#ffff00");
      this.drawStatusLED(this.statusLED, centerX - 120, centerY + 145, false);
    }
  }

  adjustBasicTemperature(amount) {
    this.currentTemp += amount;
    if (this.currentTemp < 0) this.currentTemp = 0;
    if (this.currentTemp > 300) this.currentTemp = 300;

    // Actualizar displays con nuevas coordenadas
    this.tempDisplay.setText(`${this.currentTemp}°C`);
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    this.drawBasicTempGauge(this.tempGauge, centerX - 120, centerY - 40, this.currentTemp);
  }

  // Función eliminada - ahora usamos palancas de precisión

  // Función obsoleta eliminada - se usa toggleBasicSwitch

  drawBasicButton(graphics, x, y, text, color) {
    graphics.clear();

    // Base del botón con gradiente
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRoundedRect(x - 14, y - 12, 28, 24, 6);

    // Botón principal con efecto 3D
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(x - 12, y - 10, 24, 20, 4);

    // Brillo superior
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillRoundedRect(x - 12, y - 10, 24, 8, 4);

    // Borde brillante
    graphics.lineStyle(2, 0x60a5fa, 0.8);
    graphics.strokeRoundedRect(x - 14, y - 12, 28, 24, 6);
  }

  drawBasicTempGauge(graphics, x, y, temperature) {
    graphics.clear();

    const barWidth = 80;
    const barHeight = 20;
    const maxTemp = 300;
    const fillWidth = (temperature / maxTemp) * barWidth;

    // Base de la barra horizontal
    graphics.fillStyle(0x374151, 1);
    graphics.fillRoundedRect(x - barWidth/2, y - barHeight/2, barWidth, barHeight, 4);

    // Borde de la barra
    graphics.lineStyle(2, 0x6b7280, 1);
    graphics.strokeRoundedRect(x - barWidth/2, y - barHeight/2, barWidth, barHeight, 4);

    // Relleno de temperatura (desde izquierda hacia derecha)
    const tempColor = temperature > 180 ? 0xef4444 : temperature > 160 ? 0xf59e0b : 0x10b981;
    graphics.fillStyle(tempColor, 1);
    graphics.fillRoundedRect(x - barWidth/2 + 2, y - barHeight/2 + 2, fillWidth - 4, barHeight - 4, 2);

    // Efecto de brillo en la barra
    graphics.fillStyle(0xffffff, 0.3);
    graphics.fillRoundedRect(x - barWidth/2 + 2, y - barHeight/2 + 3, fillWidth - 4, 4, 1);

    // Marcas de escala horizontales
    graphics.lineStyle(1, 0x9ca3af, 0.6);
    for (let i = 0; i <= 4; i++) {
      const markX = x - barWidth/2 + (i * barWidth/4);
      graphics.beginPath();
      graphics.moveTo(markX, y + barHeight/2 + 2);
      graphics.lineTo(markX, y + barHeight/2 + 6);
      graphics.strokePath();
    }
  }

  drawStatusLED(graphics, x, y, isActive) {
    graphics.clear();

    // Base del LED de estado
    graphics.fillStyle(0x374151, 1);
    graphics.fillCircle(x, y, 8);

    if (isActive) {
      // LED activo (verde)
      graphics.fillStyle(0x10b981, 1);
      graphics.fillCircle(x, y, 6);

      // Brillo
      graphics.fillStyle(0xffffff, 0.6);
      graphics.fillCircle(x - 1, y - 1, 2);
    } else {
      // LED inactivo (rojo)
      graphics.fillStyle(0xef4444, 1);
      graphics.fillCircle(x, y, 6);
    }

    // Borde
    graphics.lineStyle(1, 0x6b7280, 0.8);
    graphics.strokeCircle(x, y, 8);
  }

  drawPrecisionLever(graphics, x, y, isOn, color) {
    graphics.clear();

    // Base de la palanca
    graphics.fillStyle(0x1e293b, 1);
    graphics.fillRoundedRect(x - 18, y - 8, 36, 16, 4);

    // Palanca principal
    if (isOn) {
      graphics.fillStyle(color, 1);
      graphics.fillRoundedRect(x - 15, y - 6, 30, 12, 3);

      // Brillo superior
      graphics.fillStyle(0xffffff, 0.3);
      graphics.fillRoundedRect(x - 15, y - 6, 30, 4, 3);
    } else {
      graphics.fillStyle(0x475569, 1);
      graphics.fillRoundedRect(x - 15, y - 6, 30, 12, 3);

      // Sombra interior
      graphics.fillStyle(0x000000, 0.2);
      graphics.fillRoundedRect(x - 15, y - 6, 30, 3, 3);
    }

    // Borde de la palanca
    graphics.lineStyle(2, isOn ? color : 0x64748b, 0.8);
    graphics.strokeRoundedRect(x - 18, y - 8, 36, 16, 4);
  }

  togglePrecisionLever(index) {
    this.precisionSwitchStates[index] = !this.precisionSwitchStates[index];
    const isOn = this.precisionSwitchStates[index];

    // Actualizar visual de la palanca
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const leverX = centerX + 90 + (index * 60);
    const leverY = centerY - 30;

    this.drawPrecisionLever(this.precisionSwitches[index], leverX, leverY, isOn, 0xf59e0b);
    this.drawBasicLED(this.precisionLEDs[index], leverX, leverY + 25, isOn, 0xf59e0b);

    // Restaurar interactividad
    this.precisionSwitches[index].setInteractive(new Phaser.Geom.Rectangle(leverX - 15, leverY - 10, 30, 20), Phaser.Geom.Rectangle.Contains);
  }

  drawModernButton(graphics, x, y, text, color) {
    graphics.clear();

    // Botón básico
    graphics.fillStyle(color, 1);
    graphics.fillRect(x - 10, y - 5, 20, 10);
  }

  drawModernTempGauge(graphics, x, y, temperature) {
    graphics.clear();

    // Base del medidor
    graphics.fillStyle(0x666666, 1);
    graphics.fillCircle(x, y, 20);

    // Indicador de temperatura
    const tempColor = temperature > 60 ? 0xff0000 : temperature > 30 ? 0xffff00 : 0x00ff00;
    graphics.fillStyle(tempColor, 1);
    graphics.fillCircle(x, y, 8);
  }

  drawModernMeter(x, y, label, value, color) {
    // Barra de progreso
    const meterBg = this.add.graphics();
    meterBg.fillStyle(0x1f2937, 1);
    meterBg.fillRoundedRect(x - 15, y - 5, 30, 10, 3);
    this.gameElements.push(meterBg);

    // Progreso
    const progress = this.add.graphics();
    const progressWidth = (value / 100) * 28;
    progress.fillStyle(color, 0.8);
    progress.fillRoundedRect(x - 14, y - 4, progressWidth, 8, 2);
    this.gameElements.push(progress);

    // Etiqueta
    const meterLabel = this.add.text(x, y - 15, label, {
      fontSize: "10px",
      fill: "#94a3b8",
      fontFamily: "Arial Bold"
    }).setOrigin(0.5);
    this.gameElements.push(meterLabel);

    // Valor
    const meterValue = this.add.text(x, y + 15, `${value}%`, {
      fontSize: "10px",
      fill: "#e2e8f0",
      fontFamily: "Arial Bold"
    }).setOrigin(0.5);
    this.gameElements.push(meterValue);
  }

  drawStatusIndicator(graphics, x, y, isActive) {
    graphics.clear();

    // Base del indicador
    graphics.fillStyle(0x1f2937, 1);
    graphics.fillCircle(x, y, 8);

    // Estado
    if (isActive) {
      graphics.fillStyle(0x10b981, 0.3);
      graphics.fillCircle(x, y, 12);

      graphics.fillStyle(0x10b981, 1);
      graphics.fillCircle(x, y, 6);

      graphics.fillStyle(0xffffff, 0.8);
      graphics.fillCircle(x - 2, y - 2, 2);
    } else {
      graphics.fillStyle(0x6b7280, 1);
      graphics.fillCircle(x, y, 6);
    }

    // Borde
    graphics.lineStyle(1, 0x374151, 1);
    graphics.strokeCircle(x, y, 8);
  }

  // Funciones de efectos visuales eliminadas para mejor rendimiento

  adjustModernTemperature(amount) {
    this.currentTemperature = Math.max(0, Math.min(100, (this.currentTemperature || 25) + amount));

    if (this.tempDisplay) {
      this.tempDisplay.setText(`${this.currentTemperature}°C`);
    }

    if (this.tempGauge) {
      this.drawModernTempGauge(this.tempGauge, this.tempGauge.x, this.tempGauge.y, this.currentTemperature);
    }
  }

  toggleSwitch(index) {
    // Cambiar estado
    this.switchStates[index] = !this.switchStates[index];

    // Obtener coordenadas exactas que coincidan con createPrecisionControls
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    const x = centerX - 250; // Posición base del panel de control
    const y = centerY - 10;
    const switchX = x - 50 + (index * 50); // Coordenadas exactas de createPrecisionControls
    const switchY = y + 10; // Posición exacta de createPrecisionControls

    // Actualizar posición visual de la palanca con diseño limpio
    const switchHandle = this.switches[index];
    switchHandle.clear();

    // Mantener la interactividad después del clear
    switchHandle.setInteractive(new Phaser.Geom.Rectangle(switchX - 12, switchY - 5, 24, 30), Phaser.Geom.Rectangle.Contains);
    if (!switchHandle.listenerCount('pointerdown')) {
      switchHandle.on('pointerdown', () => this.toggleSwitch(index));
      this.addButtonEffects(switchHandle);
    }

    if (this.switchStates[index]) {
      // Estado ON - palanca arriba
      // Sombra sutil
      switchHandle.fillStyle(0x000000, 0.2);
      switchHandle.fillRoundedRect(switchX - 5, switchY - 1, 12, 12, 3);

      // Palanca principal verde
      switchHandle.fillStyle(0x10b981, 1);
      switchHandle.fillRoundedRect(switchX - 6, switchY - 2, 12, 12, 3);

      // Borde limpio
      switchHandle.lineStyle(1, 0x059669, 1);
      switchHandle.strokeRoundedRect(switchX - 6, switchY - 2, 12, 12, 3);

      // Brillo sutil
      switchHandle.fillStyle(0xffffff, 0.4);
      switchHandle.fillRoundedRect(switchX - 4, switchY, 8, 2, 1);
    } else {
      // Estado OFF - palanca abajo (posición original)
      // Sombra sutil
      switchHandle.fillStyle(0x000000, 0.2);
      switchHandle.fillRoundedRect(switchX - 5, switchY + 9, 12, 12, 3);

      // Palanca principal gris
      switchHandle.fillStyle(0x6b7280, 1);
      switchHandle.fillRoundedRect(switchX - 6, switchY + 8, 12, 12, 3);

      // Borde limpio
      switchHandle.lineStyle(1, 0x4b5563, 1);
      switchHandle.strokeRoundedRect(switchX - 6, switchY + 8, 12, 12, 3);

      // Brillo sutil
      switchHandle.fillStyle(0xffffff, 0.2);
      switchHandle.fillRoundedRect(switchX - 4, switchY + 10, 8, 2, 1);
    }

    // Actualizar bombillo indicador con diseño limpio
    const bulb = this.bulbs[index];
    bulb.clear();

    if (this.switchStates[index]) {
      // Bombillo verde (ON)
      // Sombra sutil
      bulb.fillStyle(0x000000, 0.2);
      bulb.fillCircle(switchX + 1, switchY + 36, 6);

      // Bombillo principal verde
      bulb.fillStyle(0x10b981, 1);
      bulb.fillCircle(switchX, switchY + 35, 6);

      // Borde limpio
      bulb.lineStyle(1, 0x059669, 1);
      bulb.strokeCircle(switchX, switchY + 35, 6);

      // Brillo sutil
      bulb.fillStyle(0xffffff, 0.5);
      bulb.fillCircle(switchX - 2, switchY + 33, 2);
    } else {
      // Bombillo rojo (OFF)
      // Sombra sutil
      bulb.fillStyle(0x000000, 0.2);
      bulb.fillCircle(switchX + 1, switchY + 36, 6);

      // Bombillo principal rojo
      bulb.fillStyle(0xef4444, 1);
      bulb.fillCircle(switchX, switchY + 35, 6);

      // Borde limpio
      bulb.lineStyle(1, 0xdc2626, 1);
      bulb.strokeCircle(switchX, switchY + 35, 6);

      // Brillo sutil
      bulb.fillStyle(0xffffff, 0.2);
      bulb.fillCircle(switchX - 2, switchY + 33, 2);
    }

    // Actualizar estado del sistema
    this.updateSwitchSystem();

    // Verificar calibración
    this.checkCalibrationComplete();
  }

  updateSwitchSystem() {
    const activeCount = this.switchStates.filter(state => state).length;

    if (activeCount >= 2) {
      this.systemStatus.setText("SISTEMA: ACTIVO");
      this.systemStatus.setFill("#00ff00");
    } else {
      this.systemStatus.setText("SISTEMA: INACTIVO");
      this.systemStatus.setFill("#ff0000");
    }
  }

  updatePrecisionDisplay() {
    if (this.precisionDisplay) {
      this.precisionDisplay.setText(`${this.currentPrecision.toFixed(3)}`);
    }
  }

  // Función duplicada eliminada - se usa createModernTemperatureControls

  // Función duplicada eliminada - se usa createModernSystemMeters

  addButtonEffects(button) {
    // Efectos de botones simplificados sin animaciones
    button.on('pointerover', () => {
      button.setAlpha(0.8);
    });

    button.on('pointerout', () => {
      button.setAlpha(1);
    });
  }

  adjustPrecision(amount) {
    this.currentPrecision = Math.max(0.01, this.currentPrecision + amount);
    // Redondear a 3 decimales para evitar errores de precisión flotante
    this.currentPrecision = Math.round(this.currentPrecision * 1000) / 1000;
    // Mantener el estado de temperatura estable
    this.temperatureStable = Math.abs(this.currentTemp - this.targetTemp) < 5;
    this.updateAllDisplays();
    this.checkCalibrationComplete();
  }

  resetPrecision() {
    this.currentPrecision = Math.round((0.5 + Math.random() * 0.3) * 1000) / 1000; // Valor aleatorio (0.5-0.8mm) lejos del objetivo, redondeado
    this.updatePrecisionDisplay();
    if (this.precisionKnob && this.precisionProgressBar && this.sliderParams) {
      this.updatePrecisionSlider(this.sliderParams.sliderX, this.sliderParams.sliderY + this.sliderParams.sliderHeight/2, this.sliderParams.sliderWidth);
    }
    // Mantener el estado de temperatura estable
    this.temperatureStable = Math.abs(this.currentTemp - this.targetTemp) < 5;
    this.updateAllDisplays();
    this.checkCalibrationComplete();
  }

  adjustTemperature(amount) {
    this.currentTemp = Math.max(150, Math.min(250, this.currentTemp + amount));
    this.temperatureStable = Math.abs(this.currentTemp - this.targetTemp) < 5;
    this.updateAllDisplays();
    this.checkCalibrationComplete();
  }

  resetTemperature() {
    this.currentTemp = Math.floor(195 + Math.random() * 10); // Valor aleatorio lejos del objetivo, sin decimales
    this.temperatureStable = Math.abs(this.currentTemp - this.targetTemp) < 5;
    this.updateAllDisplays();
    this.checkCalibrationComplete();
  }

  setPrecisionExact(value) {
    // Establecer valor exacto sin redondeo
    this.currentPrecision = value;
    this.updatePrecisionDisplay();
    if (this.precisionKnob && this.precisionProgressBar && this.sliderParams) {
      this.updatePrecisionSlider(this.sliderParams.sliderX, this.sliderParams.sliderY + this.sliderParams.sliderHeight/2, this.sliderParams.sliderWidth);
    }
    this.temperatureStable = Math.abs(this.currentTemp - this.targetTemp) < 5;
    this.updateAllDisplays();
    this.checkCalibrationComplete();
  }

  updateAllDisplays() {


    // Actualizar display de temperatura
    if (this.temperatureDisplay) {
      this.temperatureDisplay.setText(`${this.currentTemp}°C / ${this.targetTemp}°C`);
      this.temperatureDisplay.setFill(this.temperatureStable ? "#00ff00" : "#ff6600");
    }

    if (this.temperatureBar) {
      this.temperatureBar.clear();
      const tempPercent = Math.max(0, Math.min(1, (this.currentTemp - 150) / 100));

      // Obtener posición del medidor desde el panel de medidores
      const centerX = this.cameras.main.centerX;
      const meterY = this.cameras.main.centerY + 130; // Posición Y del panel de medidores

      // Calcular coordenadas exactas para la barra
      const barStartX = centerX + 20;
      const barY = meterY - 5;
      const barMaxWidth = 250; // Barra más larga
      const barWidth = Math.max(8, barMaxWidth * tempPercent); // Asegurar ancho mínimo
      const barHeight = 18; // Barra más alta

      // Dibujar fondo de la barra primero
      this.temperatureBar.fillStyle(0x333333, 0.8);
      this.temperatureBar.fillRoundedRect(barStartX - 2, barY - 2, barMaxWidth + 4, barHeight + 4, 3);
      this.temperatureBar.lineStyle(1, 0x666666, 1);
      this.temperatureBar.strokeRoundedRect(barStartX - 2, barY - 2, barMaxWidth + 4, barHeight + 4, 3);

      // Dibujar barra de progreso con mejor aspecto
      this.temperatureBar.fillStyle(this.temperatureStable ? 0x00ff00 : 0xff6600, 1);
      this.temperatureBar.fillRoundedRect(barStartX, barY, barWidth, barHeight, 2);

      // Añadir brillo a la barra para efecto 3D
      if (barWidth > 8) {
        this.temperatureBar.fillStyle(0xffffff, 0.4);
        this.temperatureBar.fillRoundedRect(barStartX, barY, barWidth, 4, 2);
      }

      // Añadir texto de temperatura actual en el medidor
      if (this.tempValueText) {
        this.tempValueText.destroy();
      }

      // Posicionar el texto en el centro de la barra visible
      let textX = barStartX + (barWidth / 2);
      if (barWidth < 60) { // Si la barra es muy pequeña, colocar el texto al final
        textX = barStartX + 60;
      }

      this.tempValueText = this.add.text(textX, barY + 9, `${this.currentTemp}°C`, {
        fontSize: "12px",
        fill: "#ffffff",
        fontFamily: "Arial Bold",
        stroke: "#000000",
        strokeThickness: 2
      }).setOrigin(0.5);
      this.gameElements.push(this.tempValueText);
    }

    // Actualizar LEDs de estado
    if (this.statusLEDs) {
      const precisionOK = this.currentPrecision >= 0.03 && this.currentPrecision <= 0.08;
      const tempOK = this.currentTemp >= 180 && this.currentTemp <= 190;
      const defectsOK = this.defectivePartsFound >= this.targetDefects;

      this.statusLEDs[0].setFillStyle(precisionOK ? 0x00ff00 : 0xff0000);
      this.statusLEDs[1].setFillStyle(tempOK ? 0x00ff00 : 0xff0000);
      this.statusLEDs[2].setFillStyle(defectsOK ? 0x00ff00 : 0xff0000);
      this.statusLEDs[3].setFillStyle((precisionOK && tempOK && defectsOK) ? 0x00ff00 : 0xff0000);
    }

    // Actualizar etiqueta de estado del sistema
    if (this.statusLabel) {
      const switchesActive = this.switchStates.filter(Boolean).length;
      const isActive = switchesActive >= 2;
      this.statusLabel.setText("SISTEMA " + (isActive ? "ACTIVO" : "INACTIVO"));
      this.statusLabel.setFill(isActive ? "#00ff00" : "#ff0000");
    }

    // Actualizar información de palancas activas
    if (this.switchInfo) {
      const switchesActive = this.switchStates.filter(Boolean).length;
      this.switchInfo.setText(`PALANCAS: ${switchesActive}/3`);
      this.switchInfo.setFill(switchesActive >= 2 ? "#00ff00" : "#ffffff");
    }

    // Actualizar estado de la impresora
    if (this.printerStatus) {
      const precisionOK = this.currentPrecision >= 0.03 && this.currentPrecision <= 0.08;
      const tempOK = this.currentTemp >= 180 && this.currentTemp <= 190;
      const defectsOK = this.defectivePartsFound >= this.targetDefects;

      if (precisionOK && tempOK && defectsOK) {
        this.printerStatus.setText("LISTO PARA\nPRODUCCIÓN");
        this.printerStatus.setFill("#00ff00");
      } else {
        this.printerStatus.setText("");
        this.printerStatus.setFill("#fbbf24");
      }
    }

    // Verificar si la calibración está completa
    this.checkCalibrationComplete();
  }

  checkCalibrationComplete() {
    console.log('🚀 INICIANDO checkCalibrationComplete()');
    console.log('🚀 this.mainLeverStates:', this.mainLeverStates);
    console.log('🚀 this.currentTemp:', this.currentTemp);
    console.log('🚀 this.calibrationComplete:', this.calibrationComplete);

    // Validación del nuevo sistema de palancas principales
    const activeCount = this.mainLeverStates ? this.mainLeverStates.filter(state => state).length : 0;
    const switchesOK = activeCount === 2; // Exactamente 2 palancas activas
    const temperatureOK = this.currentTemp === 185; // Valor exacto

    console.log('=== DIAGNÓSTICO DEL SISTEMA ===');
    console.log(`Palancas principales activas: ${activeCount}/3`);
    console.log(`Estados de palancas principales: [${this.mainLeverStates ? this.mainLeverStates.join(', ') : 'no inicializadas'}]`);
    console.log(`Temperatura actual: ${this.currentTemp}°C`);
    console.log(`Palancas OK: ${switchesOK} (necesita exactamente 2 activas)`);
    console.log(`Temperatura OK: ${temperatureOK} (debe ser exactamente 185)`);
    console.log(`Calibración ya completada: ${this.calibrationComplete}`);

    // Verificar si ambas condiciones están cumplidas, sin importar el orden
    if (!this.calibrationComplete) {
      if (switchesOK && temperatureOK) {
        console.log('🎉 ¡ACTIVANDO CALIBRACIÓN COMPLETADA! 🎉');
        this.completeCalibration();
        return;
      }

      // Mostrar mensajes de estado parcial
      if (switchesOK) {
        console.log('✅ Palancas correctas, falta ajustar temperatura');
      }
      if (temperatureOK) {
        console.log('✅ Temperatura correcta, falta ajustar palancas');
      }

      console.log('❌ No se activa la calibración');
      if (!switchesOK) console.log(`  - Palancas incorrectas: ${activeCount}/3 (necesita exactamente 2)`);
      if (!temperatureOK) console.log(`  - Temperatura incorrecta: ${this.currentTemp} (necesita 185)`);
    } else {
      console.log(`  - Ya está completada`);
    }
  }

  showCalibrationError() {
    // Mostrar mensaje de error temporal
    const errorText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50,
      "❌ VALORES INCORRECTOS\nDeben ser EXACTOS: Precisión 0.258mm, Temperatura 185°C", {
      fontSize: "18px",
      fill: "#ff4444",
      fontFamily: "Arial Bold",
      align: "center",
      stroke: "#000000",
      strokeThickness: 2,
      backgroundColor: "#1a1a1a",
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setAlpha(0);

    // Animación de aparición y desaparición
    this.tweens.add({
      targets: errorText,
      alpha: 1,
      duration: 300,
      ease: 'Power2.easeOut',
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: errorText,
            alpha: 0,
            duration: 300,
            onComplete: () => errorText.destroy()
          });
        });
      }
    });
  }

  showLeverError() {
    // Mostrar mensaje de error para las palancas
    const errorText = this.add.text(this.cameras.main.centerX, 350,
      'ERROR: Solo 2 palancas pueden estar activas\nSistema reiniciado', {
      fontSize: '18px',
      fill: '#ff0000',
      fontFamily: 'Orbitron, Arial',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 12 }
    }).setOrigin(0.5);

    // Mostrar mensaje por 2 segundos sin parpadeo
    this.time.delayedCall(2000, () => {
      errorText.destroy();
    });

    // Actualizar todas las palancas visualmente
    this.updateAllLevers();
  }

  showTemperatureRequiredMessage() {
    // Mostrar mensaje indicando que primero debe ajustar la temperatura
    const errorText = this.add.text(this.cameras.main.centerX, 350,
      '⚠️ PRIMERO DEBES AJUSTAR LA TEMPERATURA A 185°C\nLas palancas están bloqueadas', {
      fontSize: '18px',
      fill: '#ffaa00',
      fontFamily: 'Orbitron, Arial',
      fontStyle: 'bold',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 20, y: 12 }
    }).setOrigin(0.5);

    // Mostrar mensaje por 3 segundos
    this.time.delayedCall(3000, () => {
      errorText.destroy();
    });
  }

  updateAllLevers() {
    // Esta función se llamará para actualizar visualmente todas las palancas
    // cuando se reinicie el sistema por tener más de 2 activas
    // Nota: La actualización visual se maneja en el bucle de createLeversSection
    // Esta función puede expandirse para manejar actualizaciones globales
    console.log('Sistema de palancas reiniciado - Estados:', this.mainLeverStates);
  }

  completeCalibration() {
    this.calibrationComplete = true;
    this.score += 50;

    // Panel de feedback de éxito centrado y más visible
    const feedbackPanel = this.add.graphics();
    feedbackPanel.fillStyle(0x003300, 0.95);
    feedbackPanel.fillRoundedRect(this.cameras.main.centerX - 400, this.cameras.main.centerY - 200, 800, 400, 15);
    feedbackPanel.lineStyle(4, 0x00ff00, 1);
    feedbackPanel.strokeRoundedRect(this.cameras.main.centerX - 400, this.cameras.main.centerY - 200, 800, 400, 15);
    feedbackPanel.setAlpha(0);

    // Título de éxito más grande y visible
    const successTitle = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 150,
      "🎉 ¡OBJETIVO CUMPLIDO! 🎉", {
      fontSize: "32px",
      fill: "#00ff00",
      fontFamily: "Arial Black",
      stroke: "#000000",
      strokeThickness: 4
    }).setOrigin(0.5).setAlpha(0);

    // Mensaje de feedback
    const feedbackText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 100,
      "Calibración perfecta completada\nTemperatura: 185°C | 2 Palancas Activas", {
      fontSize: "18px",
      fill: "#ffffff",
      fontFamily: "Arial Bold",
      align: "center",
      wordWrap: { width: 500 }
    }).setOrigin(0.5).setAlpha(0);

    // Información educativa sobre la impresora 3D
    const educationalText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 20,
      "\n\n" +
      "• Fabricación de prototipos rápidos y precisos\n" +
      "• Producción de piezas personalizadas y complejas\n" +
      "• Creación de herramientas y moldes especializados\n" +
      "• Manufactura de componentes médicos y dentales\n" +
      "• Desarrollo de productos en la industria automotriz", {
      fontSize: "15px",
      fill: "#ffffff",
      fontFamily: "Arial",
      align: "center",
      wordWrap: { width: 700 },
      lineSpacing: 8
    }).setOrigin(0.5).setAlpha(0);

    // Mensaje de instrucción para continuar
    const clickText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 150,
      "👆 HAZ CLIC EN CUALQUIER PARTE DE LA PANTALLA PARA CONTINUAR", {
      fontSize: "18px",
      fill: "#93c5fd",
      fontFamily: "Arial Bold",
      align: "center",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5).setAlpha(0);

    // Animación de aparición
    this.tweens.add({
      targets: [feedbackPanel, successTitle, feedbackText, educationalText, clickText],
      alpha: 1,
      duration: 800,
      ease: 'Power2.easeOut',
      onComplete: () => {
        // Animación pulsante del título
        this.tweens.add({
          targets: successTitle,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 500,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.easeInOut'
        });

        // Animación pulsante del texto de clic
        this.tweens.add({
          targets: clickText,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Hacer toda la pantalla clickeable
        const clickArea = this.add.rectangle(this.cameras.main.centerX, this.cameras.main.centerY,
          this.cameras.main.width, this.cameras.main.height, 0x000000, 0);
        clickArea.setInteractive({ useHandCursor: true });

        clickArea.on('pointerdown', () => {
          // Eliminar el área de clic
          clickArea.destroy();

          // Transición a la siguiente fase
          this.tweens.add({
            targets: [feedbackPanel, successTitle, feedbackText, educationalText, clickText],
            alpha: 0,
            duration: 500,
            onComplete: () => {
              feedbackPanel.destroy();
              successTitle.destroy();
              feedbackText.destroy();
              educationalText.destroy();
              clickText.destroy();
              this.startProgrammingPhase();
            }
          });
        });
      }
    });
  }

  startProgrammingPhase() {
    this.gamePhase = 'programming';

    // Limpiar elementos anteriores
    if (this.gameElements) {
      this.gameElements.forEach(element => element.destroy());
    }
    this.gameElements = [];

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Brazo robótico
    this.createRoboticArm(centerX - 150, centerY);

    // Panel de programación
    this.createProgrammingPanel(centerX + 150, centerY);

    // Secuencia objetivo
    this.targetSequence = ['MOVER', 'ROTAR', 'AGARRAR', 'ELEVAR', 'MOVER', 'SOLTAR'];
    this.currentSequence = [];

    this.updateSequenceDisplay();
    this.updateErrorDisplay(); // Inicializar el marcador de errores
  }

  createRoboticArm(x, y) {
    // Imagen del brazo robótico
    const roboticArmImage = this.add.image(x, y, 'brazo_robotico')
      .setScale(0.4)
      .setOrigin(0.5, 0.5);
    this.gameElements.push(roboticArmImage);

    // Efectos de luz en el brazo
    const armGlow = this.add.graphics();
    armGlow.fillStyle(0x00ff88, 0.2);
    armGlow.fillCircle(x, y, 80);
    this.gameElements.push(armGlow);

    // Indicadores de estado del brazo
    this.armStatusLeds = [];
    const ledPositions = [
      { x: x - 60, y: y - 40, color: 0xff0000 }, // Rojo - Error
      { x: x - 40, y: y - 40, color: 0xffff00 }, // Amarillo - Advertencia
      { x: x - 20, y: y - 40, color: 0x00ff00 }, // Verde - OK
      { x: x, y: y - 40, color: 0x0088ff }       // Azul - Programando
    ];

    ledPositions.forEach((led, index) => {
      const ledCircle = this.add.circle(led.x, led.y, 4, led.color, 0.3)
        .setStrokeStyle(1, led.color, 0.8);
      this.armStatusLeds.push(ledCircle);
      this.gameElements.push(ledCircle);
    });

    // Panel de información del brazo
    const infoPanel = this.add.graphics();
    infoPanel.fillStyle(0x000000, 0.7);
    infoPanel.fillRoundedRect(x - 80, y + 60, 160, 40, 5);
    infoPanel.lineStyle(1, 0x00ff88, 0.8);
    infoPanel.strokeRoundedRect(x - 80, y + 60, 160, 40, 5);
    this.gameElements.push(infoPanel);

    this.armInfoText = this.add.text(x, y + 80, 'BRAZO ROBÓTICO\nEstado: Inactivo', {
      fontSize: '10px',
      fill: '#00ff88',
      fontFamily: 'Arial',
      align: 'center'
    }).setOrigin(0.5);
    this.gameElements.push(this.armInfoText);

    // Marcador de errores en el brazo robótico
    this.armErrorDisplay = this.add.text(x - 120, y - 90, 'Errores: 0/3\nFaltan: 3', {
      fontSize: '14px',
      fill: '#ff6666',
      fontFamily: 'Arial Bold',
      align: 'center',
      backgroundColor: "transparent",
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
    this.gameElements.push(this.armErrorDisplay);

    // Animación del brazo más realista
    this.tweens.add({
      targets: roboticArmImage,
      rotation: { from: -0.1, to: 0.1 },
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Animación del resplandor
    this.tweens.add({
      targets: armGlow,
      alpha: { from: 0.1, to: 0.3 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Power2.easeInOut'
    });
  }

  createProgrammingPanel(x, y) {
    // Panel principal más grande
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 0.95);
    panel.fillRoundedRect(x - 200, y - 120, 400, 240, 15);
    panel.lineStyle(3, 0x4a90e2, 1);
    panel.strokeRoundedRect(x - 200, y - 120, 400, 240, 15);
    this.gameElements.push(panel);

    // Título con nivel de dificultad
    const title = this.add.text(x, y - 100, `PROGRAMACIÓN DEL BRAZO - NIVEL ${this.difficultyLevel}`, {
      fontSize: '18px',
      fill: '#4a90e2',
      fontFamily: 'Arial Bold',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    this.gameElements.push(title);

    // Botones de comandos expandidos
    const commands = ['INICIALIZAR', 'CALIBRAR', 'MOVER_X', 'MOVER_Y', 'MOVER_Z', 'ROTAR', 'AGARRAR', 'SOLTAR', 'VERIFICAR'];
    const buttonWidth = 70;
    const buttonHeight = 25;
    const buttonsPerRow = 3;

    commands.forEach((command, index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;
      const buttonX = x - 105 + (col * 105);
      const buttonY = y - 40 + (row * 35);

      const button = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x4a90e2)
        .setStrokeStyle(2, 0x6bb6ff)
        .setInteractive({ useHandCursor: true });

      const buttonText = this.add.text(buttonX, buttonY, command, {
        fontSize: '8px',
        fill: '#ffffff',
        fontFamily: 'Arial Bold'
      }).setOrigin(0.5);

      button.on('pointerdown', () => this.addCommand(command));
      this.addButtonEffects(button);

      this.gameElements.push(button, buttonText);
    });

    // Display del objetivo (arriba)
    this.targetDisplay = this.add.text(x, y - 80, 'Objetivo: []', {
      fontSize: '12px',
      fill: '#00ff88',
      fontFamily: 'Arial',
      wordWrap: { width: 380 }
    }).setOrigin(0.5);
    this.gameElements.push(this.targetDisplay);

    // Display de secuencia actual (más abajo, más visible)
    this.sequenceDisplay = this.add.text(x, y + 150, 'Actual: []', {
      fontSize: '16px',
      fill: '#00ffff',
      fontFamily: 'Arial Bold',
      wordWrap: { width: 380 }
    }).setOrigin(0.5);
    this.gameElements.push(this.sequenceDisplay);

    // Botones de control mejorados
    const executeButton = this.add.rectangle(x - 80, y + 80, 100, 35, 0x00aa00)
      .setStrokeStyle(2, 0x00ff00)
      .setInteractive({ useHandCursor: true });
    const executeText = this.add.text(x - 80, y + 80, 'EJECUTAR', {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: 'Arial Bold'
    }).setOrigin(0.5);

    const resetButton = this.add.rectangle(x + 80, y + 80, 100, 35, 0xaa0000)
      .setStrokeStyle(2, 0xff0000)
      .setInteractive({ useHandCursor: true });
    const resetText = this.add.text(x + 80, y + 80, 'RESET', {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: 'Arial Bold'
    }).setOrigin(0.5);

    executeButton.on('pointerdown', () => this.checkProgrammingSequence());
    resetButton.on('pointerdown', () => this.resetSequence());

    this.addButtonEffects(executeButton);
    this.addButtonEffects(resetButton);

    this.gameElements.push(executeButton, executeText, resetButton, resetText);
  }

  addCommand(command) {
    if (!this.currentSequence) this.currentSequence = [];

    // Limitar la longitud de la secuencia
    if (this.currentSequence.length < 10) {
      this.currentSequence.push(command);
      this.updateSequenceDisplay();
      this.updateArmStatus('programming');

      // Efecto visual al agregar comando
      this.showCommandAdded(command);

      // Auto-verificar si la secuencia está completa
      if (this.currentSequence.length >= this.requiredSequences[this.currentSequenceIndex].length) {
        this.checkProgrammingSequence();
      }
    }
  }

  resetSequence() {
    this.currentSequence = [];
    this.updateSequenceDisplay();
    this.updateArmStatus('warning');
    this.updateErrorDisplay(); // Actualizar el display de errores y secuencias restantes
  }

  updateSequenceDisplay() {
    if (this.currentSequenceIndex < this.requiredSequences.length) {
      // Actualizar display del objetivo
      if (this.targetDisplay) {
        const target = `Objetivo: ${this.requiredSequences[this.currentSequenceIndex].join(' → ')}`;
        this.targetDisplay.setText(target);
      }

      // Actualizar display de secuencia actual
      if (this.sequenceDisplay) {
        const current = `Actual: ${this.currentSequence.join(' → ')}`;
        this.sequenceDisplay.setText(current);
      }
    }
  }

  showCommandAdded(command) {
    const commandText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 150,
      `+ ${command}`, {
      fontSize: '14px',
      fill: '#4a90e2',
      fontFamily: 'Arial Bold',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);

    this.tweens.add({
      targets: commandText,
      y: commandText.y - 30,
      alpha: { from: 1, to: 0 },
      duration: 1000,
      onComplete: () => commandText.destroy()
    });
  }

  checkProgrammingSequence() {
    const targetSequence = this.requiredSequences[this.currentSequenceIndex];
    const isCorrect = this.arraysEqual(this.currentSequence, targetSequence);

    if (isCorrect) {
      // Secuencia correcta
      this.currentSequenceIndex++;
      this.score += 100 * this.difficultyLevel;

      // Actualizar estado del brazo
      this.updateArmStatus('success');

      // Actualizar el display de errores y secuencias restantes
      this.updateErrorDisplay();

      if (this.currentSequenceIndex >= this.requiredSequences.length) {
        // Todas las secuencias completadas
        this.completeProgramming();
      } else {
        // Pasar al siguiente nivel
        this.difficultyLevel = Math.min(this.difficultyLevel + 1, this.maxDifficultyLevel);
        this.showSequenceSuccess();
        this.resetSequence();
        this.updateProgrammingDisplay();
      }
    } else {
      // Secuencia incorrecta
      this.programmingErrors++;
      this.updateArmStatus('error');

      if (this.programmingErrors >= this.maxAllowedErrors) {
        this.showGameOver('Demasiados errores de programación');
      } else {
        this.showSequenceError();
        this.resetSequence();
      }

      this.updateErrorDisplay();
    }
  }

  arraysEqual(a, b) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }

  updateArmStatus(status) {
    if (!this.armStatusLeds) return;

    // Resetear todos los LEDs
    this.armStatusLeds.forEach(led => led.setAlpha(0.3));

    switch(status) {
      case 'error':
        this.armStatusLeds[0].setAlpha(1); // Rojo
        this.armInfoText.setText('BRAZO ROBÓTICO\nEstado: Error');
        break;
      case 'warning':
        this.armStatusLeds[1].setAlpha(1); // Amarillo
        this.armInfoText.setText('BRAZO ROBÓTICO\nEstado: Advertencia');
        break;
      case 'success':
        this.armStatusLeds[2].setAlpha(1); // Verde
        this.armInfoText.setText('BRAZO ROBÓTICO\nEstado: Operativo');
        break;
      case 'programming':
        this.armStatusLeds[3].setAlpha(1); // Azul
        this.armInfoText.setText('BRAZO ROBÓTICO\nEstado: Programando');
        break;
    }
  }

  showSequenceSuccess() {
    const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200,
      `¡Secuencia ${this.currentSequenceIndex} completada!\n+${100 * this.difficultyLevel} puntos\nFaltan: ${this.requiredSequences.length - this.currentSequenceIndex}`, {
      fontSize: '24px',
      fill: '#00ff88',
      fontFamily: 'Arial Bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: successText,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 400,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.time.delayedCall(2000, () => successText.destroy());
      }
    });
  }

  showSequenceError() {
    const errorText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 200,
      `Secuencia incorrecta\nErrores: ${this.programmingErrors}/${this.maxAllowedErrors}`, {
      fontSize: '20px',
      fill: '#ff4444',
      fontFamily: 'Arial Bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.tweens.add({
      targets: errorText,
      scaleX: { from: 1.3, to: 1 },
      scaleY: { from: 1.3, to: 1 },
      alpha: { from: 1, to: 0 },
      duration: 2500,
      onComplete: () => errorText.destroy()
    });
  }

  updateErrorDisplay() {
    // Actualizar marcador de errores en el brazo robótico
    if (this.armErrorDisplay) {
      // Calcular secuencias restantes (total - completadas)
      const sequencesRemaining = this.requiredSequences.length - this.currentSequenceIndex;

      this.armErrorDisplay.setText(`Errores: ${this.programmingErrors}/${this.maxAllowedErrors}\nFaltan: ${sequencesRemaining}`);

      // Cambiar color según el estado
      if (this.programmingErrors >= this.maxAllowedErrors) {
        this.armErrorDisplay.setFill('#ff0000'); // Rojo cuando se acabaron los errores
      } else if (this.programmingErrors >= 2) {
        this.armErrorDisplay.setFill('#ff8800'); // Naranja cuando quedan pocos
      } else {
        this.armErrorDisplay.setFill('#ff6666'); // Rosa normal
      }
    }
  }

  updateProgrammingDisplay() {
    // Actualizar el display de secuencia con el objetivo actual
    this.updateSequenceDisplay();
  }

  showGameOver(reason) {
    const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY,
      `JUEGO TERMINADO\n${reason}\nPuntuación: ${this.score}`, {
      fontSize: '20px',
      fill: '#ff4444',
      fontFamily: 'Arial Bold',
      align: 'center',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      this.scene.start('scenaPrincipal');
    });
  }

  completeProgramming() {
    this.programmingComplete = true;
    this.score += 75;

    // Fondo oscuro para mejorar visibilidad
    const darkOverlay = this.add.graphics();
    darkOverlay.fillStyle(0x000000, 0.7);
    darkOverlay.fillRect(0, 0, this.cameras.main.width, this.cameras.main.height);
    darkOverlay.setAlpha(0);
    this.gameElements.push(darkOverlay);

    // Efecto de éxito
    const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 200,
      "¡PROGRAMACIÓN COMPLETADA!", {
      fontSize: "28px",
      fill: "#ffffff",
      fontFamily: "Arial Black",
      stroke: "#0066ff",
      strokeThickness: 5,
      shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 5, fill: true }
    }).setOrigin(0.5).setAlpha(0);
    this.gameElements.push(successText);

    // Mensaje de objetivo cumplido con feedback adicional - Estilo mejorado
    const feedbackText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 50,
      "¡OBJETIVO CUMPLIDO!\n\nHas programado correctamente el brazo robótico\npara realizar todas las secuencias de operación.\nEsto permitirá automatizar el proceso de ensamblaje\ny mejorar la eficiencia de producción.", {
      fontSize: "22px",
      fill: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
      align: "center",
      stroke: "#ff6600",
      strokeThickness: 2,
      backgroundColor: "#00000000",
      padding: { x: 20, y: 10 },
      shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 3, fill: true }
    }).setOrigin(0.5).setAlpha(0);
    this.gameElements.push(feedbackText);

    // Animación del fondo oscuro
    this.tweens.add({
      targets: darkOverlay,
      alpha: 0.8,
      duration: 800,
      onComplete: () => {
        // Animación del texto principal
        this.tweens.add({
          targets: successText,
          alpha: 1,
          scaleX: { from: 0.5, to: 1.2 },
          scaleY: { from: 0.5, to: 1.2 },
          duration: 1000,
          ease: 'Back.easeOut',
          onComplete: () => {
            // Mostrar el feedback después de la animación del texto principal
            this.tweens.add({
              targets: feedbackText,
              alpha: 1,
              y: feedbackText.y + 20,
              duration: 800,
              ease: 'Power2.easeOut',
              onComplete: () => {
                // Esperar 5 segundos exactos antes de pasar a la siguiente escena
                this.time.delayedCall(4000, () => {
                  // Pasar directamente a la escena principal sin niveles intermedios
                  this.scene.start("DroneRepairScene");
                });
              }
            });
          }
        });
      }
    });
  }

  startAssemblyPhase() {
    this.gamePhase = 'assembly';

    // Limpiar elementos anteriores
    if (this.gameElements) {
      this.gameElements.forEach(element => element.destroy());
    }
    this.gameElements = [];

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Área de ensamblaje
    this.createAssemblyArea(centerX, centerY);

    // Piezas arrastrables
    this.createDraggableParts();

    // Contador de progreso
    this.assemblyProgress = this.add.text(centerX, centerY + 150,
      `Piezas ensambladas: ${this.assembledParts}/${this.targetParts}`, {
      fontSize: "18px",
      fill: "#ffffff",
      fontFamily: "Arial Bold"
    }).setOrigin(0.5);
    this.gameElements.push(this.assemblyProgress);
  }

  createAssemblyArea(x, y) {
    // Área principal de ensamblaje
    const assemblyArea = this.add.graphics();
    assemblyArea.lineStyle(4, 0x00ff00, 1);
    assemblyArea.strokeRect(x - 150, y - 100, 300, 200);
    assemblyArea.fillStyle(0x001100, 0.3);
    assemblyArea.fillRect(x - 150, y - 100, 300, 200);
    this.gameElements.push(assemblyArea);

    // Posiciones de ensamblaje
    this.assemblySlots = [];
    for (let i = 0; i < this.targetParts; i++) {
      const slotX = x - 120 + (i % 4) * 60;
      const slotY = y - 60 + Math.floor(i / 4) * 60;

      const slot = this.add.circle(slotX, slotY, 25, 0x333333, 0.8)
        .setStrokeStyle(3, 0x666666);

      slot.occupied = false;
      slot.correctPart = i; // Cada slot tiene una pieza específica
      this.assemblySlots.push(slot);
      this.gameElements.push(slot);

      // Etiqueta del slot
      const label = this.add.text(slotX, slotY, `${i + 1}`, {
        fontSize: "14px",
        fill: "#ffffff",
        fontFamily: "Arial Bold"
      }).setOrigin(0.5);
      this.gameElements.push(label);
    }
  }

  createDraggableParts() {
    this.draggableParts = [];
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0xffa500, 0x800080];

    for (let i = 0; i < this.targetParts; i++) {
      const partX = 100 + (i % 4) * 80;
      const partY = this.cameras.main.height - 100;

      const part = this.add.graphics();
      part.fillStyle(colors[i], 1);
      part.fillCircle(0, 0, 20);
      part.lineStyle(3, 0xffffff, 1);
      part.strokeCircle(0, 0, 20);
      part.x = partX;
      part.y = partY;

      // Hacer la pieza arrastrable
      part.setInteractive({ draggable: true, useHandCursor: true });
      part.partId = i;
      part.originalX = partX;
      part.originalY = partY;

      // Eventos de arrastre
      part.on('dragstart', () => {
        part.setScale(1.2);
        part.setDepth(1000);
      });

      part.on('drag', (pointer, dragX, dragY) => {
        part.x = dragX;
        part.y = dragY;
      });

      part.on('dragend', () => {
        part.setScale(1);
        part.setDepth(0);
        this.checkAssembly(part);
      });

      this.draggableParts.push(part);
      this.gameElements.push(part);

      // Etiqueta de la pieza
      const partLabel = this.add.text(partX, partY - 35, `Pieza ${i + 1}`, {
        fontSize: "12px",
        fill: "#ffffff",
        fontFamily: "Arial Bold"
      }).setOrigin(0.5);
      this.gameElements.push(partLabel);
    }
  }

  checkAssembly(part) {
    let placed = false;

    this.assemblySlots.forEach(slot => {
      const distance = Phaser.Math.Distance.Between(part.x, part.y, slot.x, slot.y);

      if (distance < 40 && !slot.occupied) {
        if (slot.correctPart === part.partId) {
          // Pieza correcta en posición correcta
          part.x = slot.x;
          part.y = slot.y;
          slot.occupied = true;
          part.placed = true;
          this.assembledParts++;
          this.score += 15;
          placed = true;

          // Efecto visual de éxito
          slot.setStrokeStyle(3, 0x00ff00);

          // Partículas de éxito
          this.sparkParticles.emitParticleAt(slot.x, slot.y);

          this.assemblyProgress.setText(`Piezas ensambladas: ${this.assembledParts}/${this.targetParts}`);

          if (this.assembledParts >= this.targetParts) {
            this.completeAssembly();
          }
        } else {
          // Pieza incorrecta
          slot.setStrokeStyle(3, 0xff0000);
          this.time.delayedCall(500, () => {
            slot.setStrokeStyle(3, 0x666666);
          });
        }
      }
    });

    if (!placed && !part.placed) {
      // Devolver a posición original
      this.tweens.add({
        targets: part,
        x: part.originalX,
        y: part.originalY,
        duration: 300,
        ease: 'Back.easeOut'
      });
    }
  }

  completeAssembly() {
    this.assemblyComplete = true;
    this.score += 100;

    // Efecto de éxito
    const successText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 200,
      "¡ENSAMBLAJE COMPLETADO!", {
      fontSize: "24px",
      fill: "#00ff00",
      fontFamily: "Arial Black",
      stroke: "#000000",
      strokeThickness: 3
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: successText,
      alpha: 1,
      scaleX: { from: 0.5, to: 1.2 },
      scaleY: { from: 0.5, to: 1.2 },
      duration: 1000,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          successText.destroy();
          this.showFinalQuestion();
        });
      }
    });
  }

  showFinalQuestion() {
    this.gamePhase = 'question';

    // Limpiar elementos anteriores
    if (this.gameElements) {
      this.gameElements.forEach(element => element.destroy());
    }
    this.gameElements = [];

    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Panel de pregunta
    const questionPanel = this.add.graphics();
    questionPanel.fillStyle(0x000033, 0.95);
    questionPanel.fillRoundedRect(centerX - 300, centerY - 200, 600, 400, 15);
    questionPanel.lineStyle(4, 0x0066ff, 1);
    questionPanel.strokeRoundedRect(centerX - 300, centerY - 200, 600, 400, 15);
    this.gameElements.push(questionPanel);

    // Título de la pregunta
    const questionTitle = this.add.text(centerX, centerY - 160,
      "PREGUNTA FINAL - HERRAMIENTAS DE PRECISIÓN", {
      fontSize: "20px",
      fill: "#0066ff",
      fontFamily: "Arial Black",
      align: "center"
    }).setOrigin(0.5);
    this.gameElements.push(questionTitle);

    // Pregunta
    const questionText = this.add.text(centerX, centerY - 100,
      "¿Qué herramienta es esencial para verificar\nla precisión dimensional en manufactura robótica?", {
      fontSize: "18px",
      fill: "#ffffff",
      fontFamily: "Arial",
      align: "center",
      wordWrap: { width: 550 }
    }).setOrigin(0.5);
    this.gameElements.push(questionText);

    // Opciones de respuesta
    this.options.forEach((option, index) => {
      const optionY = centerY - 20 + index * 50;
      const letter = String.fromCharCode(65 + index); // A, B, C, D

      const optionButton = this.add.rectangle(centerX, optionY, 500, 40, 0x003366)
        .setStrokeStyle(2, 0x0099cc)
        .setInteractive({ useHandCursor: true });

      const optionText = this.add.text(centerX, optionY, `${letter}) ${option}`, {
        fontSize: "16px",
        fill: "#ffffff",
        fontFamily: "Arial",
        align: "center"
      }).setOrigin(0.5);

      optionButton.on('pointerdown', () => this.selectOption(index, optionButton, optionText));
      this.addButtonEffects(optionButton);

      this.gameElements.push(optionButton, optionText);
    });

    // Puntuación final
    const scoreText = this.add.text(centerX, centerY + 160,
      `Puntuación actual: ${this.score} puntos`, {
      fontSize: "18px",
      fill: "#ffff00",
      fontFamily: "Arial Bold",
      stroke: "#000000",
      strokeThickness: 2
    }).setOrigin(0.5);
    this.gameElements.push(scoreText);
  }

  selectOption(optionIndex, button, text) {
    const isCorrect = optionIndex === this.correctOption;

    if (isCorrect) {
      button.setFillStyle(0x006600);
      button.setStrokeStyle(3, 0x00ff00);
      this.score += 50;
    } else {
      button.setFillStyle(0x660000);
      button.setStrokeStyle(3, 0xff0000);
    }

    // Deshabilitar todas las opciones
    this.gameElements.forEach(element => {
      if (element.input) {
        element.disableInteractive();
      }
    });

    this.time.delayedCall(1000, () => {
      this.showFeedback(this.feedbackTexts[optionIndex], isCorrect);
    });
  }

  showFeedback(message, isCorrect) {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Panel de retroalimentación
    const feedbackPanel = this.add.graphics();
    feedbackPanel.fillStyle(isCorrect ? 0x003300 : 0x330000, 0.95);
    feedbackPanel.fillRoundedRect(centerX - 250, centerY + 50, 500, 120, 10);
    feedbackPanel.lineStyle(3, isCorrect ? 0x00ff00 : 0xff0000, 1);
    feedbackPanel.strokeRoundedRect(centerX - 250, centerY + 50, 500, 120, 10);
    this.gameElements.push(feedbackPanel);

    const feedbackText = this.add.text(centerX, centerY + 110, message, {
      fontSize: "16px",
      fill: "#ffffff",
      fontFamily: "Arial",
      align: "center",
      wordWrap: { width: 450 }
    }).setOrigin(0.5);
    this.gameElements.push(feedbackText);
  }

  getPerformanceRating() {
    if (this.score >= 250) return "EXCELENTE - Ingeniero Experto";
    if (this.score >= 200) return "MUY BUENO - Técnico Avanzado";
    if (this.score >= 150) return "BUENO - Operario Competente";
    if (this.score >= 100) return "REGULAR - Necesita Práctica";
    return "DEFICIENTE - Requiere Entrenamiento";
  }
}
