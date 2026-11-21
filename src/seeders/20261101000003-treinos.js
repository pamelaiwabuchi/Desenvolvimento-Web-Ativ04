'use strict';

const { calcularCarga } = require('../services/cargaService');

// [codigo, jogadorId, data e hora (UTC), tipo, duração em minutos, intensidade]
const treinos = [
  // ---------- Semana 1: 05/10/2026 (segunda) a 11/10/2026 (domingo) ----------
  // Mateus (A): 121.5 + 90 + 86.4 + 36 = 333.9  -> ACIMA do limite de 300
  ['TR-001', 6, '2026-10-05 08:00:00', 'F', 90, 9],
  ['TR-002', 6, '2026-10-07 08:00:00', 'F', 75, 8],
  ['TR-003', 6, '2026-10-08 15:00:00', 'T', 90, 8],
  ['TR-004', 6, '2026-10-10 10:00:00', 'E', 60, 6],
  // Lucas (M): 150 + 150 = 300  -> EMPATE com o limite, não é risco
  ['TR-005', 5, '2026-10-06 08:00:00', 'F', 100, 10],
  ['TR-006', 5, '2026-10-09 08:00:00', 'F', 100, 10],
  // Rafael (Z): 72 + 63 + 43.2 = 178.2
  ['TR-007', 2, '2026-10-05 09:00:00', 'F', 60, 8],
  ['TR-008', 2, '2026-10-07 09:00:00', 'F', 60, 7],
  ['TR-009', 2, '2026-10-09 15:00:00', 'T', 60, 6],
  // Diego (M): 72 + 50.4 + 22.5 = 144.9
  ['TR-010', 4, '2026-10-06 09:00:00', 'F', 60, 8],
  ['TR-011', 4, '2026-10-08 09:00:00', 'T', 60, 7],
  ['TR-012', 4, '2026-10-11 10:00:00', 'E', 45, 5], // domingo: ainda é semana 1
  // Carlos (G): 36 + 12 = 48
  ['TR-013', 1, '2026-10-06 15:00:00', 'T', 60, 5],
  ['TR-014', 1, '2026-10-10 10:00:00', 'E', 30, 4],
  // João (G, hoje inativo): 32.4  -> menor carga da semana 1
  ['TR-015', 8, '2026-10-05 15:00:00', 'T', 45, 6],

  // ---------- Semana 2: 12/10/2026 (segunda) a 18/10/2026 (domingo) ----------
  // Felipe (A): 135 + 81 + 97.2 = 313.2  -> ACIMA do limite
  ['TR-016', 7, '2026-10-12 08:00:00', 'F', 90, 10], // segunda: já é semana 2
  ['TR-017', 7, '2026-10-14 08:00:00', 'F', 60, 9],
  ['TR-018', 7, '2026-10-16 15:00:00', 'T', 90, 9],
  // Bruno (Z): 108 + 67.2 + 42 = 217.2
  ['TR-019', 3, '2026-10-13 08:00:00', 'F', 80, 9],
  ['TR-020', 3, '2026-10-15 15:00:00', 'T', 70, 8],
  ['TR-021', 3, '2026-10-17 10:00:00', 'E', 60, 7],
  // Carlos (G): 45
  ['TR-022', 1, '2026-10-13 09:00:00', 'F', 50, 6],
  // Diego (M): 43.2
  ['TR-023', 4, '2026-10-14 15:00:00', 'T', 60, 6],
  // Mateus (A): 16  -> menor carga da semana 2
  ['TR-024', 6, '2026-10-18 10:00:00', 'E', 40, 4],
];

module.exports = {
  async up(queryInterface) {
    const agora = new Date();
    const linhas = treinos.map(([codigo, jogadorId, data, tipo, duracaoMin, intensidade]) => ({
      codigo,
      jogadorId,
      dataTreino: new Date(data.replace(' ', 'T') + 'Z'),
      tipo,
      duracaoMin,
      intensidade,
      carga: calcularCarga(duracaoMin, intensidade, tipo),
      createdAt: agora,
      updatedAt: agora,
    }));
    await queryInterface.bulkInsert('treinos', linhas);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('treinos', null, {});
  },
};
