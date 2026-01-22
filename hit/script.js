// Масив для збереження точок
const points = [];

AFRAME.registerComponent('color-toggle', {
  init: function () {
    let el = this.el;
    this.toggleColor = function () {
      el.setAttribute('color', 'red');
    };
    el.addEventListener('click', this.toggleColor);
  },
  remove: function () {
    this.el.removeEventListener('click', this.toggleColor);
  }
});

// Функція для створення полотна з 4 точок
function createCanvasFromPoints(points, sceneEl) {
  // Створюємо geometry з вершин
  const geometry = new THREE.BufferGeometry();
  
  // Створюємо масив вершин (2 трикутники для 4 точок)
  const vertices = new Float32Array([
    points[0].x, points[0].y + 0.01, points[0].z,
    points[1].x, points[1].y + 0.01, points[1].z,
    points[2].x, points[2].y + 0.01, points[2].z,
    
    points[0].x, points[0].y + 0.01, points[0].z,
    points[2].x, points[2].y + 0.01, points[2].z,
    points[3].x, points[3].y + 0.01, points[3].z
  ]);
  
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.computeVertexNormals();
  
  // Створюємо червоний матеріал
  const material = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7
  });
  
  // Створюємо mesh
  const mesh = new THREE.Mesh(geometry, material);
  
  // Додаємо до сцени
  const entity = document.createElement('a-entity');
  entity.setObject3D('mesh', mesh);
  sceneEl.appendChild(entity);
  
  console.log('Полотно створено з точок:', points);
}

// Компонент для розміщення маячків на площині
AFRAME.registerComponent('hit-pointer', {
  init: function () {
    this.el.addEventListener('click', (evt) => {
      // Перевірка: максимум 4 точки
      if (points.length >= 4) {
        console.log('Вже створено 4 точки. Полотно готове!');
        return;
      }
      
      const point = evt.detail.intersection.point;
      const sceneEl = this.el.sceneEl;
      const marker = document.createElement('a-sphere');
      marker.setAttribute('position', `${point.x} ${point.y + 0.05} ${point.z}`);
      marker.setAttribute('radius', 0.05);
      marker.setAttribute('color', 'yellow');
      sceneEl.appendChild(marker);
      points.push(point);
      console.log(`Додано точку ${points.length}/4:`, point);
      
      // Коли додано 4 точки - створюємо полотно
      if (points.length === 4) {
        createCanvasFromPoints(points, sceneEl);
        console.log('🎉 Полотно створено!');
      }
    });
  },
  remove: function () {}
});