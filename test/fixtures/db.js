import types from 'sequelize'
import { connect } from '../../src'

const db = connect(process.env.POSTGRES_URL || `postgres://postgres@localhost:${process.env.PGPORT || 5432}/iris-ql`)

db.define('user', {
  id: {
    type: types.UUID,
    defaultValue: types.UUIDV4,
    primaryKey: true,
    allowNull: false,
    name: 'ID',
    notes: 'Unique ID',
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
    name: 'Created',
    notes: 'Date and time this data was created',
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
    name: 'Last Modified',
    notes: 'Date and time this data was last updated',
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
    get: () => 'cool-user',
    name: 'Role'
  },
  verified: {
    type: types.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    name: 'Verified',
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
    name: 'Name',
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
    name: 'Email'
  },
  authId: {
    type: types.TEXT,
    allowNull: false,
    name: 'Login ID',
    unique: 'auth_idx',
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
    name: 'Login Token',
    unique: 'auth_idx',
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      notEmpty: {
        msg: 'Must not be empty'
      }
    }
  },
  settings: {
    type: types.JSON,
    allowNull: true,
    searchable: false,
    name: 'Settings'
  },
  settingsb: {
    type: types.JSONB,
    allowNull: true,
    searchable: false,
    name: 'Settings B'
  }
}, {
  timestamps: true,
  scopes: {
    public: {
      attributes: [ 'id', 'createdAt', 'name', 'settings' ]
    }
  }
})

db.define('store', {
  id: {
    type: types.UUID,
    defaultValue: types.UUIDV4,
    primaryKey: true,
    allowNull: false,
    name: 'ID',
    notes: 'Unique ID',
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
    name: 'Created',
    notes: 'Date and time this data was created',
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
    name: 'Last Modified',
    notes: 'Date and time this data was last updated',
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
    name: 'Name',
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
    name: 'Type',
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
    type: types.GEOMETRY('POINT', 4326),
    allowNull: true,
    name: 'Location',
    notes: 'Location of the store'
  }
}, {
  timestamps: true,
  scopes: {
    public: {
      attributes: [ 'id', 'createdAt', 'name', 'type', 'location' ]
    }
  }
})

db.define('datum', {
  id: {
    type: types.UUID,
    defaultValue: types.UUIDV4,
    primaryKey: true,
    allowNull: false,
    name: 'ID',
    notes: 'Unique ID',
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
    name: 'Created',
    notes: 'Date and time this data was created',
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
    name: 'Last Modified',
    notes: 'Date and time this data was last updated',
    validate: {
      notNull: {
        msg: 'This field is required'
      },
      isDate: {
        msg: 'Must be a valid date'
      }
    }
  },
  sourceId: {
    type: types.TEXT,
    allowNull: false,
    searchable: true,
    name: 'Source ID',
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
  data: {
    type: types.JSONB,
    allowNull: true,
    name: 'Data',
    notes: 'Properties of the datum'
  },
  geometry: {
    type: types.GEOMETRY('GEOMETRY', 4326),
    allowNull: true,
    name: 'Geometry',
    notes: 'Geometry of the datum'
  }
}, {
  timestamps: true,
  scopes: {
    public: {
      attributes: [ 'id', 'createdAt', 'data', 'sourceId', 'geometry' ]
    }
  }
})

export default db
