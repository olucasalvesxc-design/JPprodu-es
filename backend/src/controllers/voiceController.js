const pool = require('../config/database');
const { cloudinary } = require('../config/cloudinary');

async function listVoices(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM voices WHERE active = true ORDER BY sort_order ASC, name ASC'
    );
    res.json({ voices: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar vozes' });
  }
}

async function getAllVoices(req, res) {
  try {
    const result = await pool.query('SELECT * FROM voices ORDER BY sort_order ASC, name ASC');
    res.json({ voices: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar vozes' });
  }
}

async function createVoice(req, res) {
  const { name, description, category, gender } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

  try {
    const audioUrl = req.file ? req.file.path : null;
    const result = await pool.query(
      `INSERT INTO voices (name, description, audio_url, category, gender)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, description, audioUrl, category || 'geral', gender || 'neutro']
    );
    res.status(201).json({ voice: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar voz' });
  }
}

async function updateVoice(req, res) {
  const { id } = req.params;
  const { name, description, category, gender, active, sort_order } = req.body;

  try {
    const audioUrl = req.file ? req.file.path : undefined;

    const current = await pool.query('SELECT * FROM voices WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Voz não encontrada' });

    const voice = current.rows[0];
    const result = await pool.query(
      `UPDATE voices
       SET name = $1, description = $2, audio_url = $3, category = $4,
           gender = $5, active = $6, sort_order = $7, updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [
        name ?? voice.name,
        description ?? voice.description,
        audioUrl ?? voice.audio_url,
        category ?? voice.category,
        gender ?? voice.gender,
        active !== undefined ? active : voice.active,
        sort_order ?? voice.sort_order,
        id,
      ]
    );
    res.json({ voice: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar voz' });
  }
}

async function deleteVoice(req, res) {
  const { id } = req.params;
  try {
    const voice = await pool.query('SELECT * FROM voices WHERE id = $1', [id]);
    if (voice.rows.length === 0) return res.status(404).json({ error: 'Voz não encontrada' });

    if (voice.rows[0].audio_url) {
      const publicId = voice.rows[0].audio_url.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`spottunner/demos/${publicId}`, { resource_type: 'video' }).catch(() => {});
    }

    await pool.query('DELETE FROM voices WHERE id = $1', [id]);
    res.json({ message: 'Voz removida' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao remover voz' });
  }
}

module.exports = { listVoices, getAllVoices, createVoice, updateVoice, deleteVoice };
