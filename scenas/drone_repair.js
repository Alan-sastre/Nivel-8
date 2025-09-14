class DroneRepairScene extends Phaser.Scene {
  constructor() {
    super({ key: 'DroneRepairScene' });

    // Variables de estado del juego
    this.currentPhase = 1;
    this.timeLeft = 120; // 2 minutos para fase 1
    this.gameTimer = null;
    this.isScanning = false;
    this.scanProgress = 0;
    this.diagnosticComplete = false;
    this.questionAnswered = false;
    this.printerCalibrated = false;

    // Variables de la impresora 3D
    this.printerParams = {
      temperature: 200,
      speed: 50,
      bedAlignment: 0
    };
  }

  createAnalysisPanel(x, y, width, height) {
     // Inicializar array para elementos del panel de análisis
     this.analysisElements = [];

     // Fondo del panel de análisis
     const analysisBg = this.add.graphics();
     // Sombra
     analysisBg.fillStyle(0x000000, 0.3);
     analysisBg.fillRoundedRect(x + 5, y + 5, width, height, 15);
     // Fondo principal gris
     analysisBg.fillStyle(0x2a2a2a, 0.95);
     analysisBg.fillRoundedRect(x, y, width, height, 15);
     // Borde
     analysisBg.lineStyle(2, 0x606060, 1);
     analysisBg.strokeRoundedRect(x, y, width, height, 15);
     analysisBg.setScrollFactor(0);
     this.analysisElements.push(analysisBg);

     // Título del panel
     const titleText = this.add.text(x + 20, y + 20, 'Resultados del Analisis', {
       fontSize: '16px',
       fill: '#e0e0e0',
       fontStyle: 'bold'
     }).setScrollFactor(0);
     this.analysisElements.push(titleText);

     // Lista de anomalías detectadas
     const anomaliesText = '🔍 ANOMALIAS DETECTADAS:\n\n🚨 Desalineacion en ensamblaje\ndel motor (+/-0.5mm)\n\n⚠️ Tolerancias incorrectas\nen helices (+/-0.2mm)\n\n🚨 Soldaduras defectuosas\nen PCB principal\n\n🔥 Calibracion incorrecta\nde sensores IMU\n\n⚡ REQUIERE INTERVENCION INMEDIATA';

     const anomaliesDisplay = this.add.text(x + 20, y + 60, anomaliesText, {
       fontSize: '12px',
       fill: '#d0d0d0',
       fontFamily: 'Arial',
       wordWrap: { width: width - 40 },
       lineSpacing: 3
     }).setScrollFactor(0);
     this.analysisElements.push(anomaliesDisplay);

     // Recuadro de herramientas eliminado por solicitud del usuario
   }

  preload() {
    // Cargar assets necesarios para la escena
    this.load.image('factory_bg', 'assets/scenaPrincipal/1.jpg');
    this.load.image('scanner', 'assets/drones/1.png');
    this.load.image('printer3d', 'assets/drones/1.jpg');
    this.load.image('particle', 'assets/drones/1.png');
  }

  create() {
    // Crear fondo animado industrial
    this.createAdvancedIndustrialBackground();

    // Crear sistema de partículas de fondo
    this.createBackgroundEffects();

    // Crear interfaz base
    this.createBaseUI();

    // Iniciar Fase 1
    this.startPhase1();

    // Iniciar timer
    this.startGameTimer();
  }

  createAdvancedIndustrialBackground() {
    // Obtener dimensiones de la cámara
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    
    // Fondo con gradiente dinámico más oscuro que cubra toda la pantalla
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0a0f, 0x1a1a2e, 0x2d1b69, 0x11998e, 1);
    bg.fillRect(0, 0, gameWidth, gameHeight);
    bg.setDepth(-100);

    // Crear 30 partículas flotantes azules
    this.floatingParticles = [];
    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, gameWidth),
        Phaser.Math.Between(0, gameHeight),
        Phaser.Math.Between(2, 6),
        0x4a90e2,
        0.6
      );
      particle.setDepth(-90);
      particle.velocityX = Phaser.Math.FloatBetween(-0.5, 0.5);
      particle.velocityY = Phaser.Math.FloatBetween(-0.3, 0.3);
      particle.originalAlpha = Phaser.Math.FloatBetween(0.3, 0.8);
      particle.pulseSpeed = Phaser.Math.FloatBetween(0.02, 0.05);
      this.floatingParticles.push(particle);
    }

    // Crear 8 líneas de energía verdes
    this.energyLines = [];
    for (let i = 0; i < 8; i++) {
      const line = this.add.graphics();
      line.lineStyle(2, 0x00ff88, 0.8);
      const startX = Phaser.Math.Between(0, gameWidth);
      const startY = Phaser.Math.Between(0, gameHeight);
      const endX = startX + Phaser.Math.Between(-100, 100);
      const endY = startY + Phaser.Math.Between(-100, 100);
      line.lineBetween(startX, startY, endX, endY);
      line.setDepth(-85);
      line.cycleTime = Phaser.Math.FloatBetween(0, Math.PI * 2);
      this.energyLines.push(line);
    }

    // Crear puntos brillantes pulsantes
    this.glowDots = [];
    for (let x = 100; x < gameWidth; x += 150) {
      for (let y = 100; y < gameHeight; y += 120) {
        const dot = this.add.circle(x, y, 3, 0x00d4ff, 0.7);
        dot.setDepth(-88);
        dot.pulsePhase = Phaser.Math.FloatBetween(0, Math.PI * 2);
        this.glowDots.push(dot);
      }
    }

    // Líneas decorativas en las esquinas más gruesas y brillantes
    const cornerLines = this.add.graphics();
    cornerLines.lineStyle(4, 0x00d4ff, 0.9);
    // Esquina superior izquierda
    cornerLines.lineBetween(0, 0, 80, 0);
    cornerLines.lineBetween(0, 0, 0, 80);
    // Esquina superior derecha
    cornerLines.lineBetween(gameWidth - 80, 0, gameWidth, 0);
    cornerLines.lineBetween(gameWidth, 0, gameWidth, 80);
    // Esquina inferior izquierda
    cornerLines.lineBetween(0, gameHeight - 80, 0, gameHeight);
    cornerLines.lineBetween(0, gameHeight, 80, gameHeight);
    // Esquina inferior derecha
    cornerLines.lineBetween(gameWidth - 80, gameHeight, gameWidth, gameHeight);
    cornerLines.lineBetween(gameWidth, gameHeight - 80, gameWidth, gameHeight);
    cornerLines.setDepth(-80);

    // Ondas de energía expansivas
    this.energyWaves = [];
    this.createEnergyWave();

    // Chispas aleatorias
    this.sparks = [];
    this.createRandomSparks();

    // Iniciar animaciones de fondo
    this.startBackgroundAnimations();
  }

  createEnergyWave() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    
    const wave = this.add.graphics();
    wave.lineStyle(3, 0x00d4ff, 0.8);
    wave.strokeCircle(gameWidth / 2, gameHeight / 2, 10);
    wave.setDepth(-87);
    
    this.tweens.add({
      targets: wave,
      scaleX: 15,
      scaleY: 15,
      alpha: 0,
      duration: 3000,
      ease: 'Power2',
      onComplete: () => {
        wave.destroy();
      }
    });
    
    this.energyWaves.push(wave);
    
    // Crear nueva onda cada 3 segundos
    this.time.delayedCall(3000, () => {
      this.createEnergyWave();
    });
  }

  createRandomSparks() {
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;
    
    for (let i = 0; i < 3; i++) {
      const spark = this.add.circle(
        Phaser.Math.Between(50, gameWidth - 50),
        Phaser.Math.Between(50, gameHeight - 50),
        Phaser.Math.Between(1, 3),
        0xffff00,
        0.9
      );
      spark.setDepth(-86);
      
      this.tweens.add({
        targets: spark,
        scaleX: 0,
        scaleY: 0,
        alpha: 0,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          spark.destroy();
        }
      });
      
      this.sparks.push(spark);
    }
    
    // Crear nuevas chispas cada 2-4 segundos
    this.time.delayedCall(Phaser.Math.Between(2000, 4000), () => {
      this.createRandomSparks();
    });
  }

  startBackgroundAnimations() {
    // Animación a ~60 FPS
    this.time.addEvent({
      delay: 16,
      callback: () => {
        // Animar partículas flotantes
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        
        this.floatingParticles.forEach(particle => {
          particle.x += particle.velocityX;
          particle.y += particle.velocityY;
          
          // Rebote en bordes
          if (particle.x <= 0 || particle.x >= gameWidth) particle.velocityX *= -1;
          if (particle.y <= 0 || particle.y >= gameHeight) particle.velocityY *= -1;
          
          // Pulsación de transparencia
          particle.alpha = particle.originalAlpha + Math.sin(this.time.now * particle.pulseSpeed) * 0.3;
        });
        
        // Animar líneas de energía
        this.energyLines.forEach(line => {
          line.cycleTime += 0.05;
          line.alpha = 0.4 + Math.sin(line.cycleTime) * 0.4;
        });
        
        // Animar puntos brillantes
        this.glowDots.forEach(dot => {
          dot.pulsePhase += 0.03;
          dot.scaleX = dot.scaleY = 1 + Math.sin(dot.pulsePhase) * 0.5;
          dot.alpha = 0.5 + Math.sin(dot.pulsePhase * 0.7) * 0.3;
        });
        
        // Animar ondas de energía
        this.energyWaves.forEach((wave, index) => {
          if (wave && wave.active) {
            // Las ondas ya tienen su propia animación con tweens
          }
        });
      },
      loop: true
    });
  }

  createBackgroundEffects() {
    // Efectos adicionales de partículas si es necesario
  }

  createBaseUI() {
    // Interfaz base simplificada sin títulos ni temporizador
  }

  startPhase1() {
    this.currentPhase = 1;

    // Crear interfaz de diagnóstico
    this.createDiagnosticInterface();
  }

  createDiagnosticInterface() {
    // Inicializar array para elementos del panel de diagnóstico
    this.diagnosticElements = [];

    // Panel principal de diagnóstico - reposicionado más arriba
    const mainPanel = this.add.graphics();
    mainPanel.fillStyle(0x1a252f, 0.95);
    mainPanel.fillRoundedRect(50, 50, 700, 400, 25);
    mainPanel.lineStyle(4, 0x00d4ff, 1.0);
    mainPanel.strokeRoundedRect(50, 50, 700, 400, 25);
    this.diagnosticElements.push(mainPanel);

    // Sombra del panel
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(55, 55, 700, 400, 25);
    shadow.setDepth(-1);
    this.diagnosticElements.push(shadow);

    // Título de la fase
    const phaseTitle = this.add.text(400, 80, 'DIAGNOSTICO DE LA FABRICA', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.diagnosticElements.push(phaseTitle);

    // Instrucciones
    this.instructionText = this.add.text(400, 110, 'Analisis completado - Revisa los resultados detectados', {
      fontSize: '18px',
      fill: '#ffeb3b',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center',
      wordWrap: { width: 600 }
    }).setOrigin(0.5);
    this.diagnosticElements.push(this.instructionText);

    // Escáner digital (botón principal)
    this.createDigitalScanner();

    // Panel de resultados
    this.createResultsPanel();

    // Barra de progreso
    this.createProgressBar();
  }

  createDigitalScanner() {
    // Fondo del escáner - reposicionado
    const scannerBg = this.add.graphics();
    scannerBg.fillStyle(0x0f1419, 0.9);
    scannerBg.fillRoundedRect(120, 150, 160, 160, 20);
    scannerBg.lineStyle(3, 0x00ff88, 1.0);
    scannerBg.strokeRoundedRect(120, 150, 160, 160, 20);
    this.diagnosticElements.push(scannerBg);

    // Icono del escáner
    this.scannerButton = this.add.image(200, 230, 'scanner')
      .setScale(1.5)
      .setInteractive({ cursor: 'pointer' })
      .setTint(0x00ff88);
    this.diagnosticElements.push(this.scannerButton);

    // Texto del escáner
    const scannerText = this.add.text(200, 330, 'ESCANER DIGITAL', {
      fontSize: '16px',
      fill: '#00ff88',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.diagnosticElements.push(scannerText);

    // Estado del escáner
    this.scannerStatus = this.add.text(200, 350, 'LISTO PARA ESCANEAR', {
      fontSize: '14px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 1
    }).setOrigin(0.5);
    this.diagnosticElements.push(this.scannerStatus);

    // Eventos del escáner
    this.scannerButton.on('pointerdown', function() {
      if (!this.isScanning && !this.diagnosticComplete) {
        this.startDiagnosticScan();
      }
    }.bind(this));

    this.scannerButton.on('pointerover', function() {
      this.scannerButton.setTint(0x88ffaa);
      this.scannerButton.setScale(1.6);
    }.bind(this));

    this.scannerButton.on('pointerout', function() {
      this.scannerButton.setTint(0x00ff88);
      this.scannerButton.setScale(1.5);
    }.bind(this));
  }

  createResultsPanel() {
    // Panel de resultados - reposicionado
    const resultsBg = this.add.graphics();
    resultsBg.fillStyle(0x2a2a2a, 0.95);
    resultsBg.fillRoundedRect(320, 150, 380, 200, 20);
    resultsBg.lineStyle(2, 0x606060, 1.0);
    resultsBg.strokeRoundedRect(320, 150, 380, 200, 20);
    this.diagnosticElements.push(resultsBg);

    // Título del panel
    const resultsTitle = this.add.text(510, 170, 'RESULTADOS DEL ANALISIS', {
      fontSize: '16px',
      fill: '#e0e0e0',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);
    this.diagnosticElements.push(resultsTitle);

    // Texto instructivo que desaparece al hacer clic
    this.instructionalText = this.add.text(510, 200, 'Dale click a la imagen para ver los análisis', {
      fontSize: '14px',
      fill: '#ffeb3b',
      fontFamily: 'Arial',
      fontStyle: 'italic',
      align: 'center',
      wordWrap: { width: 350 }
    }).setOrigin(0.5);
    this.diagnosticElements.push(this.instructionalText);

    // Lista de anomalías (inicialmente oculta)
    this.anomalyList = this.add.text(510, 250, '', {
      fontSize: '12px',
      fill: '#d0d0d0',
      fontFamily: 'Arial',
      align: 'left',
      wordWrap: { width: 350 }
    }).setOrigin(0.5);
    this.diagnosticElements.push(this.anomalyList);
  }

  createProgressBar() {
    // Fondo de la barra - reposicionado
    this.progressBg = this.add.graphics();
    this.progressBg.fillStyle(0x0f1419, 0.9);
    this.progressBg.fillRoundedRect(120, 380, 160, 30, 15);
    this.progressBg.lineStyle(3, 0x00d4ff, 1.0);
    this.progressBg.strokeRoundedRect(120, 380, 160, 30, 15);
    this.diagnosticElements.push(this.progressBg);

    // Barra de progreso
    this.progressBar = this.add.graphics();
    this.diagnosticElements.push(this.progressBar);

    // Texto de progreso
    this.progressText = this.add.text(200, 395, '0%', {
      fontSize: '16px',
      fill: '#00ff88',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.diagnosticElements.push(this.progressText);
  }

  startDiagnosticScan() {
    this.isScanning = true;
    this.scanProgress = 0;

    // Ocultar texto instructivo
    if (this.instructionalText) {
      this.instructionalText.setVisible(false);
    }

    // Actualizar estado
    this.scannerStatus.setText('ESCANEANDO...');
    this.scannerStatus.setStyle({ fill: '#ffeb3b' });
    this.instructionText.setText('Analizando la cadena de produccion...');

    // Animación del escáner
    this.tweens.add({
      targets: this.scannerButton,
      scaleX: { from: 1.5, to: 1.8 },
      scaleY: { from: 1.5, to: 1.8 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    // Progreso del escaneo
    this.scanTween = this.tweens.add({
      targets: this,
      scanProgress: 100,
      duration: 4000,
      onUpdate: function() {
        this.updateProgressBar();
      }.bind(this),
      onComplete: function() {
        this.completeDiagnostic();
      }.bind(this)
    });
  }

  updateProgressBar() {
    // Barra de progreso eliminada - solo actualizar texto
    this.progressText.setText(Math.floor(this.scanProgress) + '%');
  }

  completeDiagnostic() {
    this.isScanning = false;
    this.diagnosticComplete = true;

    // Detener animación del escáner
    this.tweens.killTweensOf(this.scannerButton);
    this.scannerButton.setScale(1.5);

    // Actualizar estado
    this.scannerStatus.setText('ANALISIS COMPLETO');
    this.scannerStatus.setStyle({ fill: '#00ff88' });
    this.instructionText.setText('Analisis completado - Revisa los resultados detectados');

    // Generar anomalías detectadas
    this.anomalies = [
      '🚨 Desalineacion en ensamblaje del motor (+/-0.5mm)',
      '⚠️ Tolerancias incorrectas en helices (+/-0.2mm)',
      '🚨 Soldaduras defectuosas en PCB principal',
      '🔥 Calibracion incorrecta de sensores IMU'
    ];

    // Mostrar resultados
    let resultsText = '🔍 ANOMALIAS DETECTADAS:\n\n';
    for (var i = 0; i < this.anomalies.length; i++) {
      resultsText += (i + 1) + '. ' + this.anomalies[i] + '\n';
    }
    resultsText += '\n⚡ REQUIERE INTERVENCION INMEDIATA';

    this.anomalyList.setText(resultsText);
    this.anomalyList.setStyle({
      fill: '#ffffff',
      fontSize: '11px',
      stroke: '#000000',
      strokeThickness: 1
    });

    // Mostrar pregunta después de 3 segundos
    this.time.delayedCall(3000, function() {
      this.showEducationalQuestion();
    }.bind(this));
  }

  showEducationalQuestion() {
    // Ocultar panel de diagnóstico
    for (var i = 0; i < this.diagnosticElements.length; i++) {
      this.diagnosticElements[i].setVisible(false);
    }

    // Usar dimensiones de la cámara para posicionamiento relativo
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Layout de dos columnas: pregunta izquierda, resultados derecha
    const leftPanelWidth = Math.max(350, gameWidth * 0.45);
    const rightPanelWidth = Math.max(300, gameWidth * 0.35);
    const panelHeight = Math.max(400, Math.min(500, gameHeight * 0.7));
    const gap = 20;

    // Posiciones
    const leftPanelX = (gameWidth - leftPanelWidth - rightPanelWidth - gap) / 2;
    const rightPanelX = leftPanelX + leftPanelWidth + gap;
    const panelY = (gameHeight - panelHeight) / 2;

    // === PANEL IZQUIERDO: PREGUNTA ===
    // Fondo del panel de pregunta con gradiente y sombra
    const questionBg = this.add.graphics();
    // Sombra
    questionBg.fillStyle(0x000000, 0.3);
    questionBg.fillRoundedRect(leftPanelX + 5, panelY + 5, leftPanelWidth, panelHeight, 15);
    // Fondo principal con gradiente simulado
    questionBg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
    questionBg.fillRoundedRect(leftPanelX, panelY, leftPanelWidth, panelHeight, 15);
    // Borde brillante
    questionBg.lineStyle(3, 0x00d4ff, 1);
    questionBg.strokeRoundedRect(leftPanelX, panelY, leftPanelWidth, panelHeight, 15);

    // Icono de pregunta
    const questionIcon = this.add.text(
      leftPanelX + 25,
      panelY + 20,
      '?',
      { fontSize: '24px', fill: '#00d4ff' }
    );

    // Título "Pregunta Educativa"
    this.add.text(
      leftPanelX + 60,
      panelY + 25,
      'Pregunta Educativa',
      {
        fontSize: '16px',
        fill: '#00d4ff',
        fontStyle: 'bold'
      }
    );

    // Texto de la pregunta con mejor estilo
    const questionFontSize = Math.max(16, Math.min(20, gameWidth * 0.025));
    const questionText = this.add.text(
      leftPanelX + leftPanelWidth / 2,
      panelY + 70,
      '¿Que herramienta se usa para verificar la precision de las piezas fabricadas?',
      {
        fontSize: questionFontSize + 'px',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: leftPanelWidth - 40 },
        lineSpacing: 5,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0);

    // Opciones de respuesta - distribuidas verticalmente y centradas
    const options = [
      'Una regla de medición común',
      'Un calibrador digital',
      'Un sensor de temperatura',
      'Un osciloscopio'
    ];

    const optionButtons = [];
    const optionSpacing = Math.max(40, gameHeight * 0.06);
    const optionFontSize = Math.max(14, Math.min(18, gameWidth * 0.022));

    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      var index = i;
      const optionY = panelY + 160 + (index * optionSpacing);

      // Fondo de la opción con gradiente sutil
      const optionBg = this.add.graphics();
      // Sombra de opción
      optionBg.fillStyle(0x000000, 0.3);
      optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
      // Fondo principal con gradiente
      optionBg.fillGradientStyle(0x4a5568, 0x2d3748, 0x4a5568, 0x2d3748, 0.9);
      optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
      optionBg.lineStyle(2, 0x63b3ed, 0.8);
      optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);

      // Letra de opción con círculo brillante
      const letterBg = this.add.graphics();
      letterBg.fillGradientStyle(0x4299e1, 0x63b3ed, 0x4299e1, 0x63b3ed, 1);
      letterBg.fillCircle(leftPanelX + 40, optionY + 5, 12);
      letterBg.lineStyle(2, 0x2b6cb0, 1);
      letterBg.strokeCircle(leftPanelX + 40, optionY + 5, 12);

      const letterText = this.add.text(
        leftPanelX + 40,
        optionY + 5,
        String.fromCharCode(65 + index),
        {
          fontSize: '14px',
          fill: '#000000',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      // Texto de la opción
      const optionText = this.add.text(
        leftPanelX + 65,
        optionY,
        option,
        {
          fontSize: optionFontSize + 'px',
          fill: '#ffffff',
          wordWrap: { width: leftPanelWidth - 100 },
          lineSpacing: 3
        }
      ).setOrigin(0, 0);

      // Hacer la opción interactiva
    optionBg.setInteractive(new Phaser.Geom.Rectangle(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5), Phaser.Geom.Rectangle.Contains);
    optionBg.on('pointerdown', function(idx) {
      return function() {
        this.selectOption(idx, optionBg, optionY, leftPanelX, leftPanelWidth, optionSpacing); // Permitir múltiples selecciones
      }.bind(this);
    }.bind(this)(index));

    // Guardar referencia para poder modificar después
    optionBg.isMarked = false;

      // Efectos hover mejorados
      optionBg.on('pointerover', function() {
        if (!optionBg.isMarked) {
          optionBg.clear();
          // Sombra hover
          optionBg.fillStyle(0x000000, 0.4);
          optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
          // Fondo hover con gradiente brillante
          optionBg.fillGradientStyle(0x5a67d8, 0x667eea, 0x5a67d8, 0x667eea, 0.95);
          optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
          optionBg.lineStyle(3, 0x4c51bf, 1);
          optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
        }
      });

      optionBg.on('pointerout', function() {
        if (!optionBg.isMarked) {
          optionBg.clear();
          // Restaurar estado normal
          optionBg.fillStyle(0x000000, 0.3);
          optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
          optionBg.fillGradientStyle(0x4a5568, 0x2d3748, 0x4a5568, 0x2d3748, 0.9);
          optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
          optionBg.lineStyle(2, 0x63b3ed, 0.8);
          optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
        }
      });

      optionButtons.push(optionBg);
    }

    // === PANEL DERECHO: RESULTADOS DEL ANÁLISIS ===
    this.createAnalysisPanel(rightPanelX, panelY, rightPanelWidth, panelHeight);

    // Guardar referencias para poder eliminarlas después
    this.questionElements = [questionBg, questionIcon, questionText].concat(optionButtons);
    this.optionButtons = optionButtons;
    this.correctAnswer = 1; // Índice de la respuesta correcta
    this.selectedAnswers = new Set(); // Para rastrear respuestas seleccionadas
  }

  selectOption(selectedIndex, optionBg, optionY, leftPanelX, leftPanelWidth, optionSpacing) {
    // Verificar si ya fue seleccionada
    if (this.selectedAnswers.has(selectedIndex)) {
      return;
    }

    this.selectedAnswers.add(selectedIndex);

    if (selectedIndex === this.correctAnswer) {
       // Respuesta correcta - marcar en verde y continuar
       optionBg.clear();
       optionBg.fillStyle(0x000000, 0.3);
       optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
       optionBg.fillGradientStyle(0x38a169, 0x48bb78, 0x38a169, 0x48bb78, 0.9);
       optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
       optionBg.lineStyle(3, 0x2f855a, 1);
       optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
       optionBg.isMarked = true;

       // Mostrar mensaje y feedback al mismo tiempo en un recuadro más grande
        const successBg = this.add.graphics();
        successBg.fillStyle(0x38a169, 0.9);
        successBg.fillRoundedRect(200, 250, 400, 180, 15);
        successBg.lineStyle(4, 0x2f855a, 1);
        successBg.strokeRoundedRect(200, 250, 400, 180, 15);

        const successText = this.add.text(400, 300, '¡Correcto!', {
          fontSize: '28px',
          fill: '#ffffff',
          fontFamily: 'Arial',
          align: 'center',
          fontWeight: 'bold'
        }).setOrigin(0.5);

        // Mostrar feedback educativo al mismo tiempo
        const feedbackText = this.add.text(400, 360, 'Un calibrador digital permite medir\ncon alta precisión y verificar\nsi las piezas cumplen con\nlas dimensiones necesarias.', {
          fontSize: '16px',
          fill: '#ffffff',
          fontFamily: 'Arial',
          align: 'center',
          wordWrap: { width: 380 }
        }).setOrigin(0.5);

        // Destruir elementos después de 4 segundos
        this.time.delayedCall(4000, () => {
          successBg.destroy();
          successText.destroy();
          feedbackText.destroy();
          this.answerQuestion(true, selectedIndex);
        });
     } else {
      // Respuesta incorrecta - marcar en rojo
      optionBg.clear();
      optionBg.fillStyle(0x000000, 0.3);
      optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
      optionBg.fillGradientStyle(0xe53e3e, 0xf56565, 0xe53e3e, 0xf56565, 0.9);
      optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
      optionBg.lineStyle(3, 0xc53030, 1);
      optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
      optionBg.isMarked = true;

      // Mostrar feedback de intento
      const feedbackText = this.add.text(400, 350, 'Respuesta incorrecta. Sigue intentando.', {
        fontSize: '16px',
        fill: '#ff6b6b',
        fontFamily: 'Arial',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      this.questionElements.push(feedbackText);

      // Eliminar el feedback después de 2 segundos
      this.time.delayedCall(2000, () => {
        feedbackText.destroy();
      });
    }
  }

  answerQuestion(isCorrect, selectedIndex) {
    this.questionAnswered = true;

    // Limpiar elementos de la pregunta inmediatamente
    if (this.questionElements) {
      this.questionElements.forEach(element => {
        if (element && element.destroy) {
          element.destroy();
        }
      });
      this.questionElements = [];
    }

    // Limpiar elementos del panel de análisis
    if (this.analysisElements) {
      this.analysisElements.forEach(element => {
        if (element && element.destroy) {
          element.destroy();
        }
      });
      this.analysisElements = [];
    }

    // Transición a Fase 2 inmediatamente - la limpieza completa se hará en startPhase2
    this.startPhase2();
  }

  startPhase2() {
    // Limpiar elementos de Fase 1
    this.children.removeAll();

    // Recrear fondo y UI base
    this.add.image(400, 300, 'factory_bg');
    this.createBackgroundEffects();

    this.currentPhase = 2;
    this.timeLeft = 240; // 4 minutos para fase 2

    // Actualizar UI base
    this.createBaseUI();

    // Mostrar segunda pregunta educativa
    this.showSecondEducationalQuestion();
  }

  createRepairInterface() {
    // Panel principal de reparación
    const mainPanel = this.add.graphics();
    mainPanel.fillStyle(0x1a252f, 0.95);
    mainPanel.fillRoundedRect(50, 120, 700, 400, 25);
    mainPanel.lineStyle(4, 0xff6b35, 1.0);
    mainPanel.strokeRoundedRect(50, 120, 700, 400, 25);

    // Título de la fase
    this.add.text(400, 150, 'REPARACION DE IMPRESORA 3D INDUSTRIAL', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Instrucciones
    this.instructionText = this.add.text(400, 180, 'Ajusta los parametros de la impresora para restaurar la precision', {
      fontSize: '18px',
      fill: '#ffeb3b',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
      align: 'center'
    }).setOrigin(0.5);

    // Crear impresora 3D visual
    this.createPrinter3D();

    // Crear controles de parámetros
    this.createPrinterControls();

    // Crear panel de estado
    this.createStatusPanel();
  }

  createPrinter3D() {
    // Contenedor de la impresora
    const printerContainer = this.add.container(200, 320);

    // Impresora 3D
    this.printer3D = this.add.image(0, 0, 'printer3d')
      .setScale(1.8)
      .setTint(0xcccccc);

    // Indicador de estado
    this.printerStatus = this.add.text(0, 100, 'REQUIERE CALIBRACION', {
      fontSize: '16px',
      fill: '#ff4757',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5);

    // Efecto de calor (cuando esté funcionando)
    this.printerHeat = this.add.circle(0, -20, 40, 0xff4444, 0);

    printerContainer.add([this.printer3D, this.printerStatus, this.printerHeat]);
  }

  createPrinterControls() {
    // Panel de controles
    const controlsBg = this.add.graphics();
    controlsBg.fillStyle(0x2c3e50, 0.9);
    controlsBg.fillRoundedRect(420, 220, 300, 250, 15);
    controlsBg.lineStyle(2, 0x3498db, 1.0);
    controlsBg.strokeRoundedRect(420, 220, 300, 250, 15);

    // Título de controles
    this.add.text(570, 240, 'CONTROLES DE CALIBRACION', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setOrigin(0.5);

    // Control de temperatura
    this.createParameterControl('Temperatura', 'temperature', 570, 280, 'C', 180, 250);

    // Control de velocidad
    this.createParameterControl('Velocidad', 'speed', 570, 330, '%', 20, 100);

    // Control de alineación
    this.createParameterControl('Alineacion', 'bedAlignment', 570, 380, 'mm', -2, 2);

    // Botón de calibrar
    this.calibrateButton = this.add.text(570, 430, 'CALIBRAR IMPRESORA', {
      fontSize: '16px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      backgroundColor: '#27ae60',
      padding: { x: 15, y: 10 }
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    this.calibrateButton.on('pointerdown', function() {
      this.calibratePrinter();
    }.bind(this));

    this.calibrateButton.on('pointerover', function() {
      this.calibrateButton.setStyle({ backgroundColor: '#2ecc71' });
    }.bind(this));

    this.calibrateButton.on('pointerout', function() {
      this.calibrateButton.setStyle({ backgroundColor: '#27ae60' });
    }.bind(this));
  }

  createParameterControl(label, param, x, y, unit, min, max) {
    // Etiqueta del parámetro
    this.add.text(x - 120, y, label, {
      fontSize: '14px',
      fill: '#ecf0f1',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    });

    // Valor actual
    const valueText = this.add.text(x + 80, y, this.printerParams[param] + unit, {
      fontSize: '14px',
      fill: '#00ff88',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    });

    // Botones de ajuste
    const decreaseBtn = this.add.text(x - 20, y, '◀', {
      fontSize: '16px',
      fill: '#e74c3c',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setInteractive({ cursor: 'pointer' });

    const increaseBtn = this.add.text(x + 20, y, '▶', {
      fontSize: '16px',
      fill: '#27ae60',
      fontFamily: 'Arial',
      fontWeight: 'bold'
    }).setInteractive({ cursor: 'pointer' });

    // Eventos de los botones
    decreaseBtn.on('pointerdown', function() {
      if (this.printerParams[param] > min) {
        this.printerParams[param] -= (param === 'bedAlignment') ? 0.1 : (param === 'temperature') ? 5 : 5;
        this.printerParams[param] = Math.max(min, this.printerParams[param]);
        if (param === 'bedAlignment') {
          this.printerParams[param] = Math.round(this.printerParams[param] * 10) / 10;
        }
        valueText.setText(this.printerParams[param] + unit);
        this.updatePrinterVisuals();
      }
    }.bind(this));

    increaseBtn.on('pointerdown', function() {
      if (this.printerParams[param] < max) {
        this.printerParams[param] += (param === 'bedAlignment') ? 0.1 : (param === 'temperature') ? 5 : 5;
        this.printerParams[param] = Math.min(max, this.printerParams[param]);
        if (param === 'bedAlignment') {
          this.printerParams[param] = Math.round(this.printerParams[param] * 10) / 10;
        }
        valueText.setText(this.printerParams[param] + unit);
        this.updatePrinterVisuals();
      }
    }.bind(this));
  }

  createStatusPanel() {
    // Panel de estado de la impresora
    const statusBg = this.add.graphics();
    statusBg.fillStyle(0x34495e, 0.9);
    statusBg.fillRoundedRect(80, 480, 640, 80, 15);
    statusBg.lineStyle(2, 0xf39c12, 1.0);
    statusBg.strokeRoundedRect(80, 480, 640, 80, 15);

    // Estado actual
    this.statusText = this.add.text(400, 520, 'IMPRESORA DESCONFIGURADA - Ajusta los parametros correctos', {
      fontSize: '16px',
      fill: '#f39c12',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      align: 'center'
    }).setOrigin(0.5);
  }

  updatePrinterVisuals() {
    // Actualizar color de la impresora basado en parámetros
    const tempOK = this.printerParams.temperature >= 210 && this.printerParams.temperature <= 230;
    const speedOK = this.printerParams.speed >= 40 && this.printerParams.speed <= 60;
    const alignOK = Math.abs(this.printerParams.bedAlignment) <= 0.2;

    let tint = 0xff4757; // Rojo por defecto
    if (tempOK && speedOK && alignOK) {
      tint = 0x00ff88; // Verde si todo está bien
    } else if ((tempOK && speedOK) || (tempOK && alignOK) || (speedOK && alignOK)) {
      tint = 0xffeb3b; // Amarillo si 2/3 están bien
    }

    this.printer3D.setTint(tint);

    // Actualizar efecto de calor
    if (tempOK) {
      this.printerHeat.setAlpha(0.3);
      this.tweens.add({
        targets: this.printerHeat,
        alpha: { from: 0.1, to: 0.4 },
        scaleX: { from: 0.8, to: 1.2 },
        scaleY: { from: 0.8, to: 1.2 },
        duration: 1500,
        yoyo: true,
        repeat: -1
      });
    } else {
      this.printerHeat.setAlpha(0);
    }
  }

  calibratePrinter() {
    // Verificar si los parámetros están en rango óptimo
    const tempOK = this.printerParams.temperature >= 210 && this.printerParams.temperature <= 230;
    const speedOK = this.printerParams.speed >= 40 && this.printerParams.speed <= 60;
    const alignOK = Math.abs(this.printerParams.bedAlignment) <= 0.2;

    if (tempOK && speedOK && alignOK) {
      // Calibración exitosa
      this.printerCalibrated = true;
      this.printerStatus.setText('IMPRESORA CALIBRADA');
      this.printerStatus.setStyle({ fill: '#00ff88' });
      this.statusText.setText('La impresora 3D esta operativa y puede fabricar piezas con alta precision');
      this.statusText.setStyle({ fill: '#00ff88' });

      // Animación de éxito
      this.tweens.add({
        targets: this.printer3D,
        scaleX: { from: 1.8, to: 2.0 },
        scaleY: { from: 1.8, to: 2.0 },
        duration: 500,
        yoyo: true,
        repeat: 2
      });

      // Completar misión después de 3 segundos
      this.time.delayedCall(3000, function() {
        this.showSuccess();
      }.bind(this));
    } else {
      // Calibración fallida
      let errorMsg = 'CALIBRACION FALLIDA: ';
      const errors = [];

      if (!tempOK) errors.push('Temperatura incorrecta (210-230C)');
      if (!speedOK) errors.push('Velocidad incorrecta (40-60%)');
      if (!alignOK) errors.push('Alineacion incorrecta (+/-0.2mm)');

      errorMsg += errors.join(', ');

      this.statusText.setText(errorMsg);
      this.statusText.setStyle({ fill: '#ff4757' });

      // Animación de error
      this.tweens.add({
        targets: this.printer3D,
        tint: { from: 0xff4757, to: 0xffffff },
        duration: 200,
        yoyo: true,
        repeat: 3
      });
    }
  }

  showSecondEducationalQuestion() {
    // Usar dimensiones de la cámara para posicionamiento relativo
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    // Layout de dos columnas: pregunta izquierda, resultados derecha
    const leftPanelWidth = Math.max(350, gameWidth * 0.45);
    const rightPanelWidth = Math.max(300, gameWidth * 0.35);
    const panelHeight = Math.max(400, Math.min(500, gameHeight * 0.7));
    const gap = 20;

    // Posiciones
    const leftPanelX = (gameWidth - leftPanelWidth - rightPanelWidth - gap) / 2;
    const rightPanelX = leftPanelX + leftPanelWidth + gap;
    const panelY = (gameHeight - panelHeight) / 2;

    // === PANEL IZQUIERDO: SEGUNDA PREGUNTA ===
    // Fondo del panel de pregunta con gradiente y sombra
    const questionBg = this.add.graphics();
    // Sombra
    questionBg.fillStyle(0x000000, 0.3);
    questionBg.fillRoundedRect(leftPanelX + 5, panelY + 5, leftPanelWidth, panelHeight, 15);
    // Fondo principal con gradiente simulado
    questionBg.fillGradientStyle(0x1a1a2e, 0x16213e, 0x0f3460, 0x533483, 1);
    questionBg.fillRoundedRect(leftPanelX, panelY, leftPanelWidth, panelHeight, 15);
    // Borde brillante
    questionBg.lineStyle(3, 0x00d4ff, 1);
    questionBg.strokeRoundedRect(leftPanelX, panelY, leftPanelWidth, panelHeight, 15);

    // Icono de pregunta
    const questionIcon = this.add.text(
      leftPanelX + 25,
      panelY + 20,
      '?',
      { fontSize: '24px', fill: '#00d4ff' }
    );

    // Título "Pregunta Educativa"
    this.add.text(
      leftPanelX + 60,
      panelY + 25,
      'Pregunta Educativa 2/2',
      {
        fontSize: '16px',
        fill: '#00d4ff',
        fontStyle: 'bold'
      }
    );

    // Texto de la segunda pregunta
    const questionFontSize = Math.max(16, Math.min(20, gameWidth * 0.025));
    const questionText = this.add.text(
      leftPanelX + leftPanelWidth / 2,
      panelY + 70,
      '¿Cuál es la tolerancia máxima aceptable para piezas críticas en manufactura de precisión?',
      {
        fontSize: questionFontSize + 'px',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: leftPanelWidth - 40 },
        lineSpacing: 5,
        fontStyle: 'bold'
      }
    ).setOrigin(0.5, 0);

    // Opciones de respuesta para la segunda pregunta
    const options = [
      '±5.0mm es suficiente',
      '±0.1mm para máxima precisión',
      '±1.0mm es el estándar',
      'No importa la tolerancia'
    ];

    const optionButtons = [];
    const optionSpacing = Math.max(40, gameHeight * 0.06);
    const optionFontSize = Math.max(14, Math.min(18, gameWidth * 0.022));

    for (var i = 0; i < options.length; i++) {
      var option = options[i];
      var index = i;
      const optionY = panelY + 160 + (index * optionSpacing);

      // Fondo de la opción con gradiente sutil
      const optionBg = this.add.graphics();
      // Sombra de opción
      optionBg.fillStyle(0x000000, 0.3);
      optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
      // Fondo principal con gradiente
      optionBg.fillGradientStyle(0x4a5568, 0x2d3748, 0x4a5568, 0x2d3748, 0.9);
      optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
      optionBg.lineStyle(2, 0x63b3ed, 0.8);
      optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);

      // Letra de opción con círculo brillante
      const letterBg = this.add.graphics();
      letterBg.fillGradientStyle(0x4299e1, 0x63b3ed, 0x4299e1, 0x63b3ed, 1);
      letterBg.fillCircle(leftPanelX + 40, optionY + 5, 12);
      letterBg.lineStyle(2, 0x2b6cb0, 1);
      letterBg.strokeCircle(leftPanelX + 40, optionY + 5, 12);

      const letterText = this.add.text(
        leftPanelX + 40,
        optionY + 5,
        String.fromCharCode(65 + index),
        {
          fontSize: '14px',
          fill: '#000000',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);

      // Texto de la opción
      const optionText = this.add.text(
        leftPanelX + 65,
        optionY,
        option,
        {
          fontSize: optionFontSize + 'px',
          fill: '#ffffff',
          wordWrap: { width: leftPanelWidth - 100 },
          lineSpacing: 3
        }
      ).setOrigin(0, 0);

      // Hacer la opción interactiva
      optionBg.setInteractive(new Phaser.Geom.Rectangle(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5), Phaser.Geom.Rectangle.Contains);
      optionBg.on('pointerdown', function(idx) {
        return function() {
          this.selectSecondOption(idx, optionBg, optionY, leftPanelX, leftPanelWidth, optionSpacing);
        }.bind(this);
      }.bind(this)(index));

      // Guardar referencia para poder modificar después
      optionBg.isMarked = false;

      // Efectos hover mejorados
      optionBg.on('pointerover', function() {
        if (!optionBg.isMarked) {
          optionBg.clear();
          // Sombra hover
          optionBg.fillStyle(0x000000, 0.4);
          optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
          // Fondo hover con gradiente brillante
          optionBg.fillGradientStyle(0x5a67d8, 0x667eea, 0x5a67d8, 0x667eea, 0.95);
          optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
          optionBg.lineStyle(3, 0x4c51bf, 1);
          optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
        }
      });

      optionBg.on('pointerout', function() {
        if (!optionBg.isMarked) {
          optionBg.clear();
          // Restaurar estado normal
          optionBg.fillStyle(0x000000, 0.3);
          optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
          optionBg.fillGradientStyle(0x4a5568, 0x2d3748, 0x4a5568, 0x2d3748, 0.9);
          optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
          optionBg.lineStyle(2, 0x63b3ed, 0.8);
          optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
        }
      });

      optionButtons.push(optionBg);
    }

    // === PANEL DERECHO: INFORMACIÓN SOBRE TOLERANCIAS ===
    this.createToleranceInfoPanel(rightPanelX, panelY, rightPanelWidth, panelHeight);

    // Guardar referencias para poder eliminarlas después
    this.secondQuestionElements = [questionBg, questionIcon, questionText].concat(optionButtons);
    this.secondOptionButtons = optionButtons;
    this.secondCorrectAnswer = 1; // Índice de la respuesta correcta (±0.1mm)
    this.secondSelectedAnswers = new Set(); // Para rastrear respuestas seleccionadas
  }

  createToleranceInfoPanel(x, y, width, height) {
    // Inicializar array para elementos del panel de tolerancias
    this.toleranceElements = [];

    // Fondo del panel de tolerancias
    const toleranceBg = this.add.graphics();
    // Sombra
    toleranceBg.fillStyle(0x000000, 0.3);
    toleranceBg.fillRoundedRect(x + 5, y + 5, width, height, 15);
    // Fondo principal gris
    toleranceBg.fillStyle(0x2a2a2a, 0.95);
    toleranceBg.fillRoundedRect(x, y, width, height, 15);
    // Borde
    toleranceBg.lineStyle(2, 0x606060, 1);
    toleranceBg.strokeRoundedRect(x, y, width, height, 15);
    toleranceBg.setScrollFactor(0);
    this.toleranceElements.push(toleranceBg);

    // Título del panel
    const titleText = this.add.text(x + 20, y + 20, 'Tolerancias en Manufactura', {
      fontSize: '16px',
      fill: '#e0e0e0',
      fontStyle: 'bold'
    }).setScrollFactor(0);
    this.toleranceElements.push(titleText);

    // Información sobre tolerancias
    const toleranceText = '📏 NIVELES DE TOLERANCIA:\n\n🔴 ±0.01-0.1mm\nAeroespacial, médico\n\n🟡 ±0.1-0.5mm\nAutomotriz, electrónica\n\n🟢 ±0.5-1.0mm\nMaquinaria general\n\n🔵 ±1.0mm+\nEstructuras, construcción\n\n⚡ La precisión determina\nla calidad y funcionalidad';

    const toleranceDisplay = this.add.text(x + 20, y + 60, toleranceText, {
      fontSize: '12px',
      fill: '#d0d0d0',
      fontFamily: 'Arial',
      wordWrap: { width: width - 40 },
      lineSpacing: 3
    }).setScrollFactor(0);
    this.toleranceElements.push(toleranceDisplay);
  }

  selectSecondOption(selectedIndex, optionBg, optionY, leftPanelX, leftPanelWidth, optionSpacing) {
    // Verificar si ya fue seleccionada
    if (this.secondSelectedAnswers.has(selectedIndex)) {
      return;
    }

    this.secondSelectedAnswers.add(selectedIndex);

    if (selectedIndex === this.secondCorrectAnswer) {
      // Respuesta correcta - marcar en verde y continuar
      optionBg.clear();
      optionBg.fillStyle(0x000000, 0.3);
      optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
      optionBg.fillGradientStyle(0x38a169, 0x48bb78, 0x38a169, 0x48bb78, 0.9);
      optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
      optionBg.lineStyle(3, 0x2f855a, 1);
      optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
      optionBg.isMarked = true;

      // Mostrar mensaje y feedback al mismo tiempo en un recuadro más grande
      const successBg = this.add.graphics();
      successBg.fillStyle(0x38a169, 0.9);
      successBg.fillRoundedRect(200, 250, 400, 180, 15);
      successBg.lineStyle(4, 0x2f855a, 1);
      successBg.strokeRoundedRect(200, 250, 400, 180, 15);

      const successText = this.add.text(400, 300, '¡Excelente!', {
        fontSize: '28px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        fontWeight: 'bold'
      }).setOrigin(0.5);

      // Mostrar feedback educativo al mismo tiempo
      const feedbackText = this.add.text(400, 360, 'Las tolerancias de ±0.1mm son\nideales para piezas críticas que\nrequieren máxima precisión\ny funcionalidad óptima.', {
        fontSize: '16px',
        fill: '#ffffff',
        fontFamily: 'Arial',
        align: 'center',
        wordWrap: { width: 380 }
      }).setOrigin(0.5);

      // Destruir elementos después de 4 segundos y ir directamente al siguiente video
      this.time.delayedCall(4000, () => {
        successBg.destroy();
        successText.destroy();
        feedbackText.destroy();
        this.scene.start("scenaVideo2");
      });
    } else {
      // Respuesta incorrecta - marcar en rojo
      optionBg.clear();
      optionBg.fillStyle(0x000000, 0.3);
      optionBg.fillRoundedRect(leftPanelX + 22, optionY - 8, leftPanelWidth - 44, optionSpacing - 10, 8);
      optionBg.fillGradientStyle(0xe53e3e, 0xf56565, 0xe53e3e, 0xf56565, 0.9);
      optionBg.fillRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
      optionBg.lineStyle(3, 0xc53030, 1);
      optionBg.strokeRoundedRect(leftPanelX + 20, optionY - 10, leftPanelWidth - 40, optionSpacing - 5, 8);
      optionBg.isMarked = true;

      // Mostrar feedback de intento
      const feedbackText = this.add.text(400, 350, 'Respuesta incorrecta. Sigue intentando.', {
        fontSize: '16px',
        fill: '#ff6b6b',
        fontFamily: 'Arial',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 2
      }).setOrigin(0.5);

      this.secondQuestionElements.push(feedbackText);

      // Eliminar el feedback después de 2 segundos
      this.time.delayedCall(2000, () => {
        feedbackText.destroy();
      });
    }
  }







  startGameTimer() {
    // Timer deshabilitado para mejor experiencia de usuario
  }

  updateTimer() {
    // Timer deshabilitado para mejor experiencia de usuario
  }

  gameOver() {
    this.gameTimer.destroy();

    // Pantalla de game over simple
    const gameOverOverlay = this.add.graphics();
    gameOverOverlay.fillStyle(0x2c2c2c, 0.95);
    gameOverOverlay.fillRect(0, 0, 800, 600);

    // Título simple
    const gameOverText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY - 80, 'TIEMPO AGOTADO', {
      fontSize: '48px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // Panel de información simple
    const infoPanel = this.add.graphics();
    infoPanel.fillStyle(0x333333, 0.8);
    infoPanel.lineStyle(2, 0x666666, 1);
    infoPanel.fillRoundedRect(this.cameras.main.centerX - 250, this.cameras.main.centerY - 20, 500, 120, 10);
    infoPanel.strokeRoundedRect(this.cameras.main.centerX - 250, this.cameras.main.centerY - 20, 500, 120, 10);

    // Texto de información simple
    const retryText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 40, 'No completaste la misión a tiempo\nLa fábrica sigue con problemas de producción\n\n• Tiempo insuficiente para completar tareas\n• Diagnóstico incompleto', {
      fontSize: '18px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    // Botón simple para reintentar
    const retryBtn = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY + 140, 'REINTENTAR', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#555555',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive({ cursor: 'pointer' });

    retryBtn.on('pointerdown', function() {
      this.scene.restart();
    }.bind(this));
  }
}