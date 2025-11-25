const {
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  EmbedBuilder,
  MessageFlags
} = require('discord.js');
const config = require('../config/config');
const Validators = require('../utils/validators');
const EmbedUtils = require('../utils/embeds');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (!interaction.isModalSubmit()) return;

    try {
      if (interaction.customId === 'leave_request_form') {
        await handleLeaveRequestForm(interaction);
      } else if (interaction.customId === 'leave_request_form_part2') {
        await handleLeaveRequestFormPart2(interaction);
      }
    } catch (error) {
      console.error('Error handling modal submit:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Có lỗi xảy ra khi xử lý form. Vui lòng thử lại sau.',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};

async function handleLeaveRequestForm(interaction) {
  // Get form data from first modal
  const formData = {
    email: Validators.sanitizeInput(interaction.fields.getTextInputValue('email')),
    employeeId: Validators.sanitizeInput(interaction.fields.getTextInputValue('employee_id')),
    fullName: Validators.sanitizeInput(interaction.fields.getTextInputValue('full_name')),
    department: Validators.sanitizeInput(interaction.fields.getTextInputValue('department')),
    leaveDate: Validators.sanitizeInput(interaction.fields.getTextInputValue('leave_date'))
  };

  // Validate department
  if (!config.departments.includes(formData.department)) {
    storeDraftFormData(interaction, formData);

    const retryButton = new ButtonBuilder()
      .setCustomId(`retry_form_${interaction.user.id}`)
      .setLabel('🔄 Điền lại')
      .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder().addComponents(retryButton);

    return await interaction.reply({
      content: `❌ Phòng ban không hợp lệ. Vui lòng chọn một trong các phòng ban sau:\n${config.departments.map(dept => `• ${dept}`).join('\n')}`,
      components: [actionRow],
      flags: MessageFlags.Ephemeral
    });
  }

  // Validate basic form data
  const basicValidation = validateBasicFormData(formData);
  if (!basicValidation.isValid) {
    storeDraftFormData(interaction, formData);

    const retryButton = new ButtonBuilder()
      .setCustomId(`retry_form_${interaction.user.id}`)
      .setLabel('🔄 Điền lại')
      .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder().addComponents(retryButton);

    return await interaction.reply({
      content: `❌ Dữ liệu không hợp lệ:\n${basicValidation.errors.map(error => `• ${error}`).join('\n')}`,
      components: [actionRow],
      flags: MessageFlags.Ephemeral
    });
  }

  // Store form data temporarily
  if (!interaction.client.tempFormData) {
    interaction.client.tempFormData = new Map();
  }
  interaction.client.tempFormData.set(interaction.user.id, {
    ...formData,
    timestamp: Date.now()
  });

  if (interaction.client.draftFormData) {
    interaction.client.draftFormData.delete(interaction.user.id);
  }

  // Create embed showing current data and button to continue
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('📝 Thông tin đã nhập - Bước 1/2')
    .setDescription('Vui lòng kiểm tra thông tin và nhấn "Tiếp tục" để điền phần còn lại.')
    .addFields(
      { name: '📧 Email', value: formData.email, inline: true },
      { name: '🆔 Mã nhân viên', value: formData.employeeId, inline: true },
      { name: '👤 Họ và tên', value: formData.fullName, inline: true },
      { name: '🏢 Phòng ban/Công ty', value: formData.department, inline: true },
      { name: '📅 Ngày nghỉ', value: formData.leaveDate, inline: true },
      { name: '\u200B', value: '\u200B', inline: true }
    )
    .setFooter({ text: 'Bước tiếp theo: Thời gian nghỉ, lý do và quản lý trực tiếp' });

  const continueButton = new ButtonBuilder()
    .setCustomId(`continue_form_${interaction.user.id}`)
    .setLabel('➡️ Tiếp tục')
    .setStyle(ButtonStyle.Primary);

  const cancelButton = new ButtonBuilder()
    .setCustomId(`cancel_form_${interaction.user.id}`)
    .setLabel('❌ Hủy')
    .setStyle(ButtonStyle.Secondary);

  const actionRow = new ActionRowBuilder().addComponents(continueButton, cancelButton);

  await interaction.reply({
    embeds: [embed],
    components: [actionRow],
    flags: MessageFlags.Ephemeral
  });
}

async function handleLeaveRequestFormPart2(interaction) {
  // Get stored form data from first modal
  const storedData = interaction.client.tempFormData?.get(interaction.user.id);
  if (!storedData) {
    return await interaction.reply({
      content: '❌ Dữ liệu form đã hết hạn. Vui lòng sử dụng lệnh `/form` để bắt đầu lại.',
      flags: MessageFlags.Ephemeral
    });
  }

  // Get data from second modal
  const leaveTime = Validators.sanitizeInput(interaction.fields.getTextInputValue('leave_time'));
  const reason = Validators.sanitizeInput(interaction.fields.getTextInputValue('reason'));
  const directManager = Validators.sanitizeInput(interaction.fields.getTextInputValue('direct_manager'));

  // Validate leave time
  if (!config.timeOptions.includes(leaveTime)) {
    storeDraftFormDataPart2(interaction, { leaveTime, reason, directManager });

    const retryButton = new ButtonBuilder()
      .setCustomId(`retry_form_part2_${interaction.user.id}`)
      .setLabel('🔄 Điền lại')
      .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder().addComponents(retryButton);

    return await interaction.reply({
      content: `❌ Thời gian nghỉ không hợp lệ. Vui lòng chọn một trong các tùy chọn sau:\n${config.timeOptions.map(time => `• ${time}`).join('\n')}`,
      components: [actionRow],
      flags: MessageFlags.Ephemeral
    });
  }

  // Combine all form data
  const completeFormData = {
    email: storedData.email,
    employeeId: storedData.employeeId,
    fullName: storedData.fullName,
    department: storedData.department,
    leaveDate: storedData.leaveDate,
    leaveTime,
    reason,
    directManager
  };

  // Validate complete form data
  const validation = Validators.validateLeaveRequestData(completeFormData);
  if (!validation.isValid) {
    storeDraftFormDataPart2(interaction, { leaveTime, reason, directManager });

    const retryButton = new ButtonBuilder()
      .setCustomId(`retry_form_part2_${interaction.user.id}`)
      .setLabel('🔄 Điền lại')
      .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder().addComponents(retryButton);

    return await interaction.reply({
      content: `❌ Dữ liệu form không hợp lệ:\n${validation.errors.map(error => `• ${error}`).join('\n')}`,
      components: [actionRow],
      flags: MessageFlags.Ephemeral
    });
  }

  // Clean up draft data from part 2 validation
  if (interaction.client.draftFormDataPart2) {
    interaction.client.draftFormDataPart2.delete(interaction.user.id);
  }

  // Send confirmation to employee
  const confirmationEmbed = EmbedUtils.createFormSubmissionEmbed(completeFormData);
  await interaction.reply({ embeds: [confirmationEmbed], flags: MessageFlags.Ephemeral });

  // Find manager by name using CSV mapping
  const managerMapping = require('../utils/managerMapping');
  const managerId = managerMapping.getManagerIdByName(completeFormData.directManager);

  if (!managerId) {
    const allManagers = managerMapping.getAllManagerNames();
    const exampleNames = allManagers.slice(0, 3).map(name => `"${name}"`).join(', ');

    // Store draft to allow retry
    storeDraftFormDataPart2(interaction, { leaveTime, reason, directManager });

    const retryButton = new ButtonBuilder()
      .setCustomId(`retry_form_part2_${interaction.user.id}`)
      .setLabel('🔄 Điền lại')
      .setStyle(ButtonStyle.Primary);

    const actionRow = new ActionRowBuilder().addComponents(retryButton);

    return await interaction.followUp({
      content: `❌ Không tìm thấy quản lý **"${completeFormData.directManager}"** trong hệ thống.\n\n` +
        `💡 **Lưu ý**: Tên phải khớp **CHÍNH XÁC** (bao gồm hoa/thường, dấu) với tên trong danh sách.\n` +
        `📋 Hệ thống có **${allManagers.length} quản lý**.\n` +
        `✅ Ví dụ tên đúng: ${exampleNames}\n\n` +
        `Vui lòng kiểm tra lại tên hoặc liên hệ HR.`,
      components: [actionRow],
      flags: MessageFlags.Ephemeral
    });
  }

  // Clean up temporary data only after successful validation
  interaction.client.tempFormData.delete(interaction.user.id);

  try {
    // Get manager user
    const manager = await interaction.client.users.fetch(managerId);

    // Create approval embed and buttons
    const approvalEmbed = EmbedUtils.createManagerApprovalEmbed(completeFormData, interaction.user);

    const requestKey = `${interaction.user.id}_${Date.now()}`;

    const approveButton = new ButtonBuilder()
      .setCustomId(`approve_${requestKey}`)
      .setLabel('✅ Duyệt')
      .setStyle(ButtonStyle.Success);

    const rejectButton = new ButtonBuilder()
      .setCustomId(`reject_${requestKey}`)
      .setLabel('❌ Từ chối')
      .setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder().addComponents(approveButton, rejectButton);

    // Send DM to manager
    await manager.send({
      embeds: [approvalEmbed],
      components: [actionRow]
    });

    // Store request data for later use in button interactions
    if (!interaction.client.pendingRequests) {
      interaction.client.pendingRequests = new Map();
    }

    interaction.client.pendingRequests.set(requestKey, {
      requestData: completeFormData,
      employeeId: interaction.user.id,
      managerId: managerId,
      timestamp: Date.now()
    });

    console.log(`✅ Leave request sent to manager ${manager.tag} for employee ${interaction.user.tag}`);

  } catch (error) {
    console.error('Error sending request to manager:', error);

    let errorMessage = '❌ Không thể gửi yêu cầu đến trưởng phòng. Vui lòng liên hệ HR.';

    // Handle specific Discord API errors
    if (error.code === 10013) {
      errorMessage = `❌ Không tìm thấy người dùng Discord với ID quản lý "${completeFormData.directManager}". ID không hợp lệ hoặc người dùng đã rời khỏi Discord.`;
    } else if (error.code === 50013) {
      errorMessage = '❌ Bot không có quyền gửi tin nhắn đến trưởng phòng. Vui lòng liên hệ admin.';
    }

    await interaction.followUp({
      content: errorMessage,
      flags: MessageFlags.Ephemeral
    });
  }
}

// Helper function to validate basic form data
function validateBasicFormData(formData) {
  const errors = [];

  // Email validation
  if (!Validators.isValidEmail(formData.email)) {
    errors.push('Email không hợp lệ');
  }

  // Employee ID validation
  if (!Validators.isValidEmployeeId(formData.employeeId)) {
    errors.push('Mã nhân viên không hợp lệ (3-10 ký tự, chỉ chữ và số)');
  }

  // Full name validation
  if (!Validators.isValidFullName(formData.fullName)) {
    errors.push('Họ và tên phải có ít nhất 2 từ');
  }

  // Date validation
  if (!Validators.isValidDate(formData.leaveDate)) {
    errors.push('Ngày nghỉ không hợp lệ (định dạng: dd/mm/yyyy)');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

function storeDraftFormData(interaction, formData) {
  if (!interaction.client.draftFormData) {
    interaction.client.draftFormData = new Map();
  }

  interaction.client.draftFormData.set(interaction.user.id, {
    ...formData,
    timestamp: Date.now()
  });
}

function storeDraftFormDataPart2(interaction, formData) {
  if (!interaction.client.draftFormDataPart2) {
    interaction.client.draftFormDataPart2 = new Map();
  }

  interaction.client.draftFormDataPart2.set(interaction.user.id, {
    ...formData,
    timestamp: Date.now()
  });
}
