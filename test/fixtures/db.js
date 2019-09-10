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
    label: 'Role'
  },
  verified: {
    type: types.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    label: 'Verified',
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
    label: 'Email'
  },
  authId: {
    type: types.TEXT,
    allowNull: false,
    label: 'Login ID',
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
    label: 'Login Token',
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
    label: 'Settings'
  },
  settingsb: {
    type: types.JSONB,
    allowNull: true,
    searchable: false,
    label: 'Settings B'
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
    label: 'ID',
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
    label: 'Created',
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
    label: 'Last Modified',
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
    label: 'Name',
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
    label: 'ID',
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
    label: 'Created',
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
    label: 'Last Modified',
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
    label: 'Source ID',
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
    label: 'Data',
    notes: 'Properties of the datum'
  },
  geometry: {
    type: types.GEOGRAPHY,
    allowNull: true,
    label: 'Geometry',
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
