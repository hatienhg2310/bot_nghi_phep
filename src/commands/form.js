const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags
} = require('discord.js');
const config = require('../config/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('form')
    .setDescription('Mở form xin nghỉ phép'),

  async execute(interaction) {
    try {
      // Check if command is used in DM
      if (interaction.guild) {
        return await interaction.reply({
          content: '❌ Lệnh này chỉ có thể sử dụng trong tin nhắn riêng (DM) với bot.',
          flags: MessageFlags.Ephemeral
        });
      }

      // Create modal for leave request form
      const modal = new ModalBuilder()
        .setCustomId('leave_request_form')
        .setTitle('📝 Form Xin Nghỉ Phép');

      // Email input
      const emailInput = new TextInputBuilder()
        .setCustomId('email')
        .setLabel('Email công ty')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('vd: nguyen.van.a@company.com')
        .setRequired(true)
        .setMaxLength(100);

      // Employee ID input
      const employeeIdInput = new TextInputBuilder()
        .setCustomId('employee_id')
        .setLabel('Mã nhân viên')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('vd: NV001')
        .setRequired(true)
        .setMaxLength(20);

      // Full name input
      const fullNameInput = new TextInputBuilder()
        .setCustomId('full_name')
        .setLabel('Họ và tên')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('vd: Nguyễn Văn A')
        .setRequired(true)
        .setMaxLength(100);

      // Department input (will be validated against config)
      const departmentInput = new TextInputBuilder()
        .setCustomId('department')
        .setLabel('Phòng ban/Công ty')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder(`Chọn: ${config.departments.join(', ')}`)
        .setRequired(true)
        .setMaxLength(50);

      // Leave date input
      const leaveDateInput = new TextInputBuilder()
        .setCustomId('leave_date')
        .setLabel('Ngày nghỉ (Ngày/Tháng/Năm)')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('vd: Điền chính xác ngày nghỉ')
        .setRequired(true)
        .setMaxLength(10);

      // Create action rows for modal inputs
      const firstActionRow = new ActionRowBuilder().addComponents(emailInput);
      const secondActionRow = new ActionRowBuilder().addComponents(employeeIdInput);
      const thirdActionRow = new ActionRowBuilder().addComponents(fullNameInput);
      const fourthActionRow = new ActionRowBuilder().addComponents(departmentInput);
      const fifthActionRow = new ActionRowBuilder().addComponents(leaveDateInput);

      // Add action rows to modal
      modal.addComponents(
        firstActionRow,
        secondActionRow,
        thirdActionRow,
        fourthActionRow,
        fifthActionRow
      );

      // Show modal to user
      await interaction.showModal(modal);

    } catch (error) {
      console.error('Error in form command:', error);
      
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Có lỗi xảy ra khi mở form. Vui lòng thử lại sau.',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};
