import types from 'sequelize'
import { connect } from '../../src'

const db = connect(process.env.POSTGRES_URL || `postgres://postgres@localhost:${process.env.PGPORT || 5432}/iris-ql`)

db.define('user', {
  id: {
    type: types.UUID,
    defaultValue: types.UUIDV4,
    primaryKey: true,
    allowNull: false,
    label: 'ID',
    notes: 'Unique ID',
    api: {
      creatable: false,
      readable: true,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      isUUID: {
        args: 4,
        msg: 'Must be a valid UUID'
      }
    }
  },
  createdAt: {
    type: types.DATE,
    allowNull: false,
    defaultValue: types.NOW,
    label: 'Created',
    notes: 'Date and time this data was created',
    api: {
      creatable: false,
      readable: true,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      isDate: {
        msg: 'Must be a valid date'
      }
    }
  },
  updatedAt: {
    type: types.DATE,
    allowNull: false,
    defaultValue: types.NOW,
    label: 'Last Modified',
    notes: 'Date and time this data was last updated',
    api: {
      creatable: false,
      readable: true,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      isDate: {
        msg: 'Must be a valid date'
      }
    }
  },
  role: {
    type: new types.VIRTUAL(types.TEXT),
    api: {
      creatable: false,
      readable: true,
      updatable: false
    },
    get: () => 'cool-user',
    label: 'Role'
  },
  verified: {
    type: types.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    label: 'Verified',
    api: {
      creatable: false,
      readable: true,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      }
    }
  },
  name: {
    type: types.TEXT,
    allowNull: true,
    searchable: true,
    label: 'Name',
    api: {
      creatable: true,
      readable: true,
      updatable: true
    },
    validate: {
      notEmpty: {
        msg: 'Must not be empty'
      },
      len: {
        args: [ 2, 2048 ],
        msg: 'Must be between 2 and 2048 characters'
      }
    }
  },
  email: {
    type: types.TEXT,
    allowNull: false,
    unique: 'user_email_idx',
    api: {
      creatable: true,
      readable: true,
      updatable: true
    },
    validate: {
      isEmail: true,
      notNull: {
        msg: 'This field is required'
      },
      notEmpty: {
        msg: 'Must not be empty'
      },
      len: {
        args: [ 2, 2048 ],
        msg: 'Must be between 2 and 2048 characters'
      }
    },
    label: 'Email'
  },
  authId: {
    type: types.TEXT,
    allowNull: false,
    label: 'Login ID',
    unique: 'auth_idx',
    api: {
      creatable: false,
      readable: false,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      notEmpty: {
        msg: 'Must not be empty'
      }
    }
  },
  authToken: {
    type: types.TEXT,
    allowNull: false,
    label: 'Login Token',
    unique: 'auth_idx',
    api: {
      creatable: false,
      readable: false,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      notEmpty: {
        msg: 'Must not be empty'
      }
    }
  }
}, {
  timestamps: true,
  freezeTableName: true,
  scopes: {
    public: {
      attributes: [ 'id', 'createdAt', 'name' ]
    }
  }
})

db.define('store', {
  id: {
    type: types.UUID,
    defaultValue: types.UUIDV4,
    primaryKey: true,
    allowNull: false,
    label: 'ID',
    notes: 'Unique ID',
    api: {
      creatable: false,
      readable: true,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      isUUID: {
        args: 4,
        msg: 'Must be a valid UUID'
      }
    }
  },
  createdAt: {
    type: types.DATE,
    allowNull: false,
    defaultValue: types.NOW,
    label: 'Created',
    notes: 'Date and time this data was created',
    api: {
      creatable: false,
      readable: true,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      isDate: {
        msg: 'Must be a valid date'
      }
    }
  },
  updatedAt: {
    type: types.DATE,
    allowNull: false,
    defaultValue: types.NOW,
    label: 'Last Modified',
    notes: 'Date and time this data was last updated',
    api: {
      creatable: false,
      readable: true,
      updatable: false
    },
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      isDate: {
        msg: 'Must be a valid date'
      }
    }
  },
  name: {
    type: types.TEXT,
    allowNull: true,
    searchable: true,
    label: 'Name',
    api: {
      creatable: true,
      readable: true,
      updatable: true
    },
    validate: {
      notEmpty: {
        msg: 'Must not be empty'
      },
      len: {
        args: [ 2, 2048 ],
        msg: 'Must be between 2 and 2048 characters'
      }
    }
  },
  type: {
    type: types.TEXT,
    allowNull: true,
    searchable: true,
    label: 'Type',
    api: {
      creatable: true,
      readable: true,
      updatable: true
    },
    validate: {
      notEmpty: {
        msg: 'Must not be empty'
      },
      len: {
        args: [ 2, 2048 ],
        msg: 'Must be between 2 and 2048 characters'
      }
    }
  },
  location: {
    type: types.GEOGRAPHY('POINT', 4326),
    allowNull: true,
    label: 'Location',
    notes: 'Location of the store',
    api: {
      creatable: false,
      readable: true,
      updatable: false
    }
  }
}, {
  timestamps: true,
  freezeTableName: true,
  scopes: {
    public: {
      attributes: [ 'id', 'createdAt', 'name', 'type' ]
    }
  }
})

export default db
