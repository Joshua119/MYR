import 'aframe';
import 'aframe-physics-system';
import CANNON from 'cannon';

class Myr {
  constructor() {
    this.counter = 0;
    this.baseEls = [];
    this.els = [];
    this.assets = [];
    this.res = { els: this.els, assets: this.assets };
    this.color = 'red';
    this.sceneEl = document.querySelector('a-scene');
    this.position = {
      x: 0,
      y: 0,
      z: 0
    };
    this.scale = {
      x: 1,
      y: 1,
      z: 1
    };
    this.rotation = {
      x: 0,
      y: 0,
      z: 0
    };
    this.radius = 1;
  }

  /**
  * @summary - init creates and binds the myr object to the window
  * 
  * @param [{}] objs - these are the base objects for this object 
  * 
  */
  init = (objs) => {
    this.baseEls = objs || [];
    if (objs) {
      this.els = this.els.concat(objs);
      this.counter = objs.length;
    }

    // Get all the function names of the Myr(this) class
    let funs = Object.getOwnPropertyNames(this).filter((p) => {
      return typeof this[p] === 'function';
    });

    // For each function bind it to the window
    funs.forEach(element => {
      // If a collision is detected then do not override and warn
      if (window.hasOwnProperty(element)) {
        console.warn(`The ${element} of Myr is being overridden.\n` +
          `If this was not intentional consider renaming the function.`);
      } else {
        // Collision free so we can bind to window
        window[element] = this[element];
      }
    });
  }

  /**
  * @summary - Reset this.els to the base elements supplied to the constuctor
  */
  reset = () => {
    // add the base elements and then calculate the offset to user defined objects
    this.counter = this.baseEls ? this.baseEls.length : 0;

    // Reset base params, we might be able to merge two objects later
    this.color = 'red';
    this.position = { x: 0, y: 0, z: 0 };
    this.scale = { x: 1, y: 1, z: 1 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.radius = 1;
    // restore the base objects of the scene
    this.els = [].concat(this.baseEls);
  }

  genNewId = () => {
    return 'a' + this.counter++;
  };

  setPosition = (x = 0, y = 1, z = 0) => {
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      this.position = {
        x: x,
        y: y,
        z: z
      };
    } else {
      console.error("setPosition() must be all numeric values");
    }
  };

  setXPos = (x = 0) => {
    if (typeof x === 'number') {
      this.position.x = x;
    } else {
      console.error("must pass a numeric for setXPos");
    }
  };

  setYPos = (y = 0) => {
    if (typeof y === 'number') {
      this.position.y = y;
    } else {
      console.error("must pass a numeric for setYPos");
    }
  };

  setZPos = (z = 0) => {
    if (typeof z === 'number') {
      this.position.z = z;
    } else {
      console.error("must pass a numeric for setZPos");
    }
  };

  setScale = (x = 1, y = 1, z = 1) => {
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      this.scale = {
        x: x,
        y: y,
        z: z
      };
    } else {
      console.error("setScale() must be all numeric values");
    }
  };

  setXScale = (x) => {
    if (typeof x === 'number') {
      this.scale.x = x;
    } else {
      console.error("must pass a numeric for setXScale");
    }
  };

  setYScale = (y) => {
    if (typeof y === 'number') {
      this.scale.y = y;
    } else {
      console.error("must pass a numeric for setYScale");
    }
  };

  setZScale = (z) => {
    if (typeof z === 'number') {
      this.scale.z = z;
    } else {
      console.error("must pass a numeric for setZScale");
    }
  };

  setRotation = (x, y = 0, z = 0) => {
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      this.rotation = {
        x: x,
        y: y,
        z: z
      };
    } else {
      console.error("setRotation() must be all numeric values");
    }
  }

  pitchX = (x) => {
    if (typeof x === 'number') {
      this.rotation.x = x;
    } else {
      console.error("must pass a numeric for pitchX");
    }
  };

  yawY = (y) => {
    if (typeof y === 'number') {
      this.rotation.y = y;
    } else {
      console.error("must pass a numeric for yawY");
    }
  };

  rollZ = (z) => {
    if (typeof z === 'number') {
      this.rotation.z = z;
    } else {
      console.error("must pass a numeric for rollZ");
    }
  };

  setRadius = (i) => {
    if (typeof i === 'number') {
      this.radius = i;
    } else {
      console.error("must pass a numeric for setRadius");
    }
  };

  setColor = (color) => {
    this.color = color;
  }

  getRandomColor = () => {
    let color, i, letters;
    letters = '0123456789ABCDEF';
    color = '#';
    i = 0;
    while (i < 6) {
      color += letters[Math.floor(Math.random() * 16)];
      i++;
    }
    this.color = color;
    return color;
  }

  drop = (outerElId) => {
    this.getEl(outerElId)['dynamic-body'] = "shape: box; mass: 5";
    return outerElId;
  }

  push = (outerElId, x, y, z) => {
    // Add an event listener
    document.addEventListener('myr-view-rendered', (e) => {
      let el = document.querySelector('#' + outerElId);
      if (!el) {
        return;
      }
      el.addEventListener('body-loaded', () => {
        el.body.applyImpulse(
          /* impulse */        new CANNON.Vec3(x, y, z),
          /* world position */ new CANNON.Vec3().copy(el.object3D.position)
        );
      });
    });
    return outerElId;
  }

  // Render an Aframe Box Primitive with current Myr settings    
  box = (params) => {
    let base = {
      geometry: `primitive: box;`,
      id: this.genNewId(),
      material: `color:${this.color};`,
      position: this.position,
      rotation: this.rotation,
      scale: this.scale,
    };
    return this.mergeProps(base, params);
  }

  // Render an Aframe circle Primitive with current Myr settings  
  circle = (params) => {
    let base = {
      geometry: `primitive: circle;`,
      id: this.genNewId(),
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color}; side: double;`,
    };
    return this.mergeProps(base, params);
  }

  // Render an Aframe circle Primitive with current Myr settings  
  cone = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: cone; radiusBottom: 1; radiusTop: 0.1;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color}; side: double;`,
      radius: `${this.radius}`,
    };
    return this.mergeProps(base, params);
  }

  // Render an Aframe Text Primitive with current Myr settings  
  cylinder = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: cylinder;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color};  side: double;`,
      radius: `${this.radius}`,
    };
    return this.mergeProps(base, params);
  }


  // Render an Aframe dodecahedron with current Myr settings  
  dodecahedron = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: dodecahedron; radius: ${this.radius}`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color}; side: double;`,
    };
    return this.mergeProps(base, params);
  }

  // Render an Aframe icosahedron with current Myr settings  
  icosahedron = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: icosahedron;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color};  side: double;`,
    };
    return this.mergeProps(base, params);
  }

  // Render an Aframe octahedron with current Myr settings  
  octahedron = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: octahedron;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color};  side: double;`,
    };
    return this.mergeProps(base, params);
  }

  plane = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: plane; height: 1; width: 1;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color}; side: double;`,
    };
    return this.mergeProps(base, params);
  }

  // Render an Aframe Polyhedron with current Myr settings  
  polyhedron = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: sphere; segmentsWidth: 2; segmentsHeight: 8;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color}; side: double;`,
    };
    return this.mergeProps(base, params);
  }

  ring = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: ring; radiusInner: 0.5; radiusOuter: 1;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color}; side: double;`,
    };
    return this.mergeProps(base, params);
  }

  // Render an Aframe Sphere Primitive with current Myr settings  
  sphere = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: sphere`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color}`,
    };
    return this.mergeProps(base, params);
  }

  tetrahedron = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: tetrahedron;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color: ${this.color}; side: double;`,
    };
    return this.mergeProps(base, params);
  }

  /*
  * This is a bit tricky. We need to pass text so we can decide how to render it.
  * This throws a warning since text is not part of the entity system. 
  * Instead we pass it and then pull it off again if we see it.
  */
  text = (text, params) => {
    let base = {
      text: true,
      value: text || "Default",
      id: this.genNewId(),
      side: 'double',
      color: this.color,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
    };
    if (!params || typeof params === 'string') {
      this.els.push(base);
    } else {
      this.els.push({ ...base, ...params });
    }
    return base.id;
  }

  torus = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: torus; radius: ${this.radius}; radiusTubular: 0.5; arc: 360`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color:${this.color};  side: double`,
    };
    return this.mergeProps(base, params);
  }

  torusknot = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: torusKnot;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color:${this.color};`,
      p: 2,
      q: 3,
    };
    return this.mergeProps(base, params);
  }

  triangle = (params) => {
    let base = {
      id: this.genNewId(),
      geometry: `primitive: triangle;`,
      position: this.position,
      scale: this.scale,
      rotation: this.rotation,
      material: `color:${this.color};  side: double`,
    };
    return this.mergeProps(base, params);
  }

  // Render a new Aframe light with current Myr settings  
  light = (obj) => {
    let el = {
      color: this.getRandomColor(),
      position: this.position,
      geometry: {
        primitive: 'light'
      },
    };
    this.els.push(el);
    return el;
  }

  // Prism is an alias for Polyhedron
  prism = this.polyhedron

  // Cube is an alias for Box
  cube = this.box

  // Animate the Aframe element which is passed as arg
  animate = (outerElId, magnitude = 360, loop = true,  duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: rotation;
      dir: alternate;
      to: ${el.rotation.x} ${el.rotation.y + magnitude} ${el.rotation.z};
      dur: ${duration};
      loop: ${loop};
    `;
    el.animation = anim;
    return outerElId;
  };

  spin = (outerElId, magnitude = 360, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: rotation;
      dir: alternate;
      dur: ${duration};
      loop: ${loop};
      easing: linear;
      to: ${el.rotation.x} ${el.rotation.y + magnitude} ${el.rotation.z};
    `;
    el.animation__spin = anim;
    return outerElId;
  };

  yoyo = (outerElId, magnitude = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: position;
      dir: alternate;
      dur: ${duration};
      loop: ${loop};
      to: ${el.position.x} ${el.position.y + magnitude} ${el.position.z};
    `;
    el.animation__yoyo = anim;
    return outerElId;
  };

  sideToSide = (outerElId, magnitude = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      dir: alternate;
      dur: ${duration};
      loop: ${loop};
      property: position;
      to: ${el.position.x + magnitude} ${el.position.y} ${el.position.z};
    `;
    el.position = { ...el.position, x: el.position.x - magnitude };
    el.animation__sidetoside = anim;
    return outerElId;
  };

  goUp = (outerElId, magnitude = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: position; 
      dir: alternate; 
      dur: ${duration}; 
      loop: ${loop}; 
      to: ${el.position.x} ${el.position.y + magnitude} ${el.position.z};
    `;
    el.animation__goup = anim;
    return outerElId;
  };

  goDown = (outerElId, magnitude = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: position; 
      dir: alternate; 
      dur: ${duration}; 
      loop: ${loop}; 
      to: ${el.position.x} ${el.position.y - magnitude} ${el.position.z};
    `;
    el.animation__godown = anim;
    return outerElId;
  };

  goLeft = (outerElId, magnitude = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: position; 
      dir: alternate; 
      dur: ${duration}; 
      loop: ${loop}; 
      to: ${el.position.x - magnitude} ${el.position.y} ${el.position.z};
    `;
    el.animation__goleft = anim;
    return outerElId;
  };

  goRight = (outerElId, magnitude = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: position; 
      dir: alternate; 
      dur: ${duration}; 
      loop: ${loop}; 
      to: ${el.position.x + magnitude} ${el.position.y} ${el.position.z};
    `;
    el.animation__goright = anim;
    return outerElId;
  };

  goTowards = (outerElId, magnitude = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: position; 
      dir: alternate; 
      dur: ${duration}; 
      loop: ${loop}; 
      to: ${el.position.x} ${el.position.y} ${el.position.z + magnitude};
    `;
    el.animation__goleft = anim;
    return outerElId;
  };

  goAway = (outerElId, magnitude = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: position; 
      dir: alternate; 
      dur: ${duration}; 
      loop: ${loop}; 
      to: ${el.position.x} ${el.position.y} ${el.position.z - magnitude};
    `;
    el.animation__goaway = anim;
    return outerElId;
  };

  grow = (outerElId, magnitute = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: scale;
      dir: alternate;
      dur: ${duration};
      loop: ${loop};
      to: ${el.scale.x * magnitute} ${el.scale.y * magnitute} ${el.scale.z * magnitute};
    `;
    el.animation__grow = anim;
    return outerElId;
  };

  shrink = (outerElId, magnitute = 2, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: scale;
      dir: alternate;
      dur: ${duration};
      loop: ${loop};
      to: ${el.scale.x / magnitute} ${el.scale.y / magnitute} ${this.scale.z / magnitute};
    `;
    el.animation__shrink = anim;
    return outerElId;
  };

  fadeOut = (outerElId, magnitute = 0, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: components.material.material.opacity;
      dir: alternate;
      dur: ${duration};
      loop: ${loop};
      isRawProperty: true;
      from: 1;
      to: ${magnitute};
    `;
    el.material = el.material + "; transparent: true;";
    el.animation__fadeout = anim;
    return outerElId;
  }

  fadeIn = (outerElId, magnitute = 1, loop = true, duration = 1000) => {
    let el = this.getEl(outerElId);
    let anim = `
      property: components.material.material.opacity;
      dir: alternate;
      dur: ${duration};
      loop: ${loop};
      isRawProperty: true;
      from: 0;
      to: ${magnitute};
    `;
    el.material = el.material + "; transparent: true;";
    el.animation__fadein = anim;
    return outerElId;
  }

  // MODELS
  addCModel = () => {
    let asset = {
      id: 'c-obj',
      src: '/img/c.obj'
    };
    let el = {
      'obj-model': 'obj: #c-obj',
      mtl: 'c-mtl',
      position: this.position,
      scale: this.scale,
      rotation: this.rotation
    };
    this.els.push(el);
    this.assets.push(asset);
    return el;
  }

  getEl = (outerElId) => {
    return this.els[this.getIndex(outerElId)];
  }

  getIndex = (outerElId) => {
    return Number(outerElId.substr(1, outerElId.length));
  }

  /**
  * @summary - Interface for setting an object's parameters in the DOM
  * the idea is the setup an event listener as an almost DOM ready listener. 
  * 
  * @param {string} outerElId - target
  * @param {string} type - what param to change
  * @param {obj} newParam - changes
  * 
  */
  change = (outerElId, type, newParam) => {
    document.addEventListener('myr-view-rendered', (e) => {
      try {
        let el = document.querySelector('#' + outerElId);
        el.setAttribute(type, newParam);
      } catch (error) {
        return Error('change() failed execution' +
          'Ensure you are passing the proper id to the method' +
          `Error msg: ${error}`);
      }
    });
  }

  syncChange = (outerElId, type, newParam) => {
    try {
      let el = document.querySelector('#' + outerElId);
      el.setAttribute(type, newParam);
    } catch (error) {
      let err = Error('syncChange() failed execution\n' +
        'Ensure you are passing the proper id to the method' +
        `Error msg: ${error}`);
      console.error(err);
      return err;
    }
  }

  /**
  * @summary - This creates an entity w shape of object and merges with supplied params
  * 
  * @param {string} shape - one of the allowed arguments to this.core()
  * @param {obj} params - arguments to be merged, not guarenteed to be successful
  * 
  */
  mergeProps = (entity, params) => {
    if (!params || typeof params === 'string') {
      this.els.push(entity);
    } else {
      this.els.push({ ...entity, ...params });
    }
    return entity.id;
  }

  sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

export default Myr;