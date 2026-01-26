// VR/js/components.js

// Gestion de la saisie et du "Distributeur Infini"
AFRAME.registerComponent('grab-controller', {
    init: function () {
        this.grabbedEl = null;

        this.el.addEventListener('triggerdown', () => {
            // On récupère les objets touchés par le rayon
            const intersections = this.el.components.raycaster.intersections;

            if (intersections.length > 0) {
                // On prend le premier objet touché
                let targetEl = intersections[0].el;

                // GESTION INFINIE : Si l'objet est un distributeur
                if (targetEl.hasAttribute('infinite-supply')) {
                    // 1. On clone l'objet pour le laisser sur la table (c'est le prochain)
                    const clone = targetEl.cloneNode(true);
                    targetEl.parentNode.appendChild(clone);

                    // 2. L'objet qu'on a en main n'est plus infini (c'est une instance unique)
                    targetEl.removeAttribute('infinite-supply');
                    targetEl.removeAttribute('id'); // On enlève l'ID pour éviter les doublons

                    // 3. On attrape l'objet
                    this.grab(targetEl);
                } else {
                    // Saisie normale (objet déjà sorti)
                    this.grab(targetEl);
                }
            }
        });

        this.el.addEventListener('triggerup', () => {
            if (this.grabbedEl) {
                this.drop();
            }
        });
    },

    grab: function (el) {
        this.grabbedEl = el;
        // On attache l'objet à la main
        this.el.appendChild(this.grabbedEl);
        this.grabbedEl.setAttribute('position', '0 0 -0.1');
        this.grabbedEl.setAttribute('rotation', '0 0 0');
    },

    drop: function () {
        const sceneEl = document.querySelector('a-scene');
        const worldPos = new THREE.Vector3();
        const worldRot = new THREE.Quaternion();

        // On sauvegarde la position/rotation monde
        this.grabbedEl.object3D.getWorldPosition(worldPos);
        this.grabbedEl.object3D.getWorldQuaternion(worldRot);

        // On détache de la main et on remet dans la scène
        sceneEl.appendChild(this.grabbedEl);
        this.grabbedEl.setAttribute('position', worldPos);
        this.grabbedEl.object3D.quaternion.copy(worldRot);

        // Vérification Empilage
        this.checkStacking(this.grabbedEl, worldPos);

        // Vérification Cuisson (si posé sur le grill)
        const grill = document.querySelector('#cooking-zone');
        if (grill) {
            const grillPos = new THREE.Vector3();
            grill.object3D.getWorldPosition(grillPos);
            // Si on est proche du grill (0.3m) et que c'est un steak
            if (worldPos.distanceTo(grillPos) < 0.3 && this.grabbedEl.getAttribute('item-type') === 'patty') {
                this.grabbedEl.emit('start-cooking');
            }
        }

        this.grabbedEl = null;
    },

    checkStacking: function (droppedEl, dropPos) {
        // Ne s'empile que sur des objets qui ne sont PAS des distributeurs infinis
        const stackables = document.querySelectorAll('[stackable]:not([infinite-supply])');
        let target = null;
        let minDistance = 0.15;

        stackables.forEach((item) => {
            if (item !== droppedEl) {
                const itemPos = new THREE.Vector3();
                item.object3D.getWorldPosition(itemPos);
                const dist = dropPos.distanceTo(itemPos);

                if (dist < minDistance) {
                    target = item;
                    minDistance = dist;
                }
            }
        });

        if (target) {
            const targetPos = target.getAttribute('position');
            // Petit décalage aléatoire pour faire naturel
            const randomRot = Math.random() * 20 - 10;

            droppedEl.setAttribute('position', {
                x: targetPos.x,
                y: targetPos.y + 0.04, // Monte de 4cm
                z: targetPos.z
            });
            droppedEl.setAttribute('rotation', `0 ${randomRot} 0`);
        }
    }
});

// Composant simple pour la cuisson
AFRAME.registerComponent('cookable', {
    init: function() {
        this.el.addEventListener('start-cooking', () => {
            // Devient brun puis noir
            this.el.setAttribute('animation', {
                property: 'material.color',
                to: '#5C4033', // Cuit
                dur: 5000
            });
        });
    }
});

// Déclarations vides pour les sélecteurs
AFRAME.registerComponent('stackable', {});
AFRAME.registerComponent('infinite-supply', {});