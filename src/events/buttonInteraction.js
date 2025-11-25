const {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags
} = require('discord.js');
const EmbedUtils = require('../utils/embeds');
const GoogleSheetsService = require('../services/googleSheets');
const config = require('../config/config');

module.exports = {
  name: 'interactionCreate',

  async execute(interaction) {
    if (!interaction.isButton()) return;

    try {
      const customId = interaction.customId;

      if (customId.startsWith('approve_') || customId.startsWith('reject_')) {
        await handleApprovalDecision(interaction);
      } else if (customId.startsWith('continue_form_')) {
        await handleContinueForm(interaction);
      } else if (customId.startsWith('cancel_form_')) {
        await handleCancelForm(interaction);
      } else if (customId.startsWith('retry_form_part2_')) {
        await handleRetryFormPart2(interaction);
      } else if (customId.startsWith('retry_form_')) {
        await handleRetryForm(interaction);
      }
    } catch (error) {
      console.error('Error handling button interaction:', error);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ Có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại sau.',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};

async function handleApprovalDecision(interaction) {
  const customId = interaction.customId;
  const isApproval = customId.startsWith('approve_');
  const requestKey = customId.replace(/^(approve_|reject_)/, '');
  const originalMessage = interaction.message;

  // Get pending request data
  const pendingRequest = interaction.client.pendingRequests?.get(requestKey);
  if (!pendingRequest) {
    return await interaction.reply({
      content: '❌ Yêu cầu này đã hết hạn hoặc không tồn tại.',
      flags: MessageFlags.Ephemeral
    });
  }

  // Check if user is authorized to make this decision
  if (interaction.user.id !== pendingRequest.managerId) {
    return await interaction.reply({
      content: '❌ Bạn không có quyền xử lý yêu cầu này.',
      flags: MessageFlags.Ephemeral
    });
  }

  const { requestData, employeeId } = pendingRequest;
  const action = isApproval ? 'approved' : 'rejected';
  const status = isApproval ? 'Đã duyệt' : 'Từ chối';

  try {
    // Defer the reply to give us more time for processing
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    // Get employee user
    const employee = await interaction.client.users.fetch(employeeId);

    if (isApproval) {
      // If approved, add to Google Sheets
      try {
        await GoogleSheetsService.addLeaveRequest(requestData, status);
        console.log('✅ Leave request added to Google Sheets successfully');
      } catch (sheetsError) {
        console.error('❌ Error adding to Google Sheets:', sheetsError);
        // Continue with the process even if Google Sheets fails
      }

      // Send notification to HR channel
      try {
        const hrChannel = await interaction.client.channels.fetch(config.discord.hrChannelId);
        if (hrChannel) {
          const hrEmbed = EmbedUtils.createHRNotificationEmbed(requestData, interaction.user);
          await hrChannel.send({ embeds: [hrEmbed] });
          console.log('✅ HR notification sent successfully');
        }
      } catch (hrError) {
        console.error('❌ Error sending HR notification:', hrError);
        // Continue with the process even if HR notification fails
      }
    }

    // Send notification to employee
    const employeeEmbed = EmbedUtils.createEmployeeNotificationEmbed(
      requestData,
      action,
      interaction.user
    );

    try {
      await employee.send({ embeds: [employeeEmbed] });
      console.log(`✅ Employee notification sent to ${employee.tag}`);
    } catch (employeeError) {
      console.error('❌ Error sending employee notification:', employeeError);
    }

    // Send confirmation to manager
    const confirmationEmbed = EmbedUtils.createApprovalConfirmationEmbed(requestData, action);
    await interaction.editReply({ embeds: [confirmationEmbed] });

    // Disable the buttons in the original message
    const disabledApproveButton = {
      type: 2, // BUTTON
      style: 3, // SUCCESS (Green)
      label: '✅ Duyệt',
      custom_id: `approve_${requestKey}`,
      disabled: true
    };

    const disabledRejectButton = {
      type: 2, // BUTTON
      style: 4, // DANGER (Red)
      label: '❌ Từ chối',
      custom_id: `reject_${requestKey}`,
      disabled: true
    };

    const disabledComponents = [{
      type: 1, // ACTION_ROW
      components: [disabledApproveButton, disabledRejectButton]
    }];

    // Update the original message to show it's been processed
    const processedEmbed = {
      ...originalMessage.embeds[0],
      color: isApproval ? 0x00ff00 : 0xff0000, // Green for approved, red for rejected
      title: isApproval ? '✅ Đã duyệt đơn nghỉ phép' : '❌ Đã từ chối đơn nghỉ phép'
    };

    await originalMessage.edit({
      embeds: [processedEmbed],
      components: disabledComponents
    });

    // Clean up pending request
    interaction.client.pendingRequests.delete(requestKey);

    console.log(`✅ Leave request ${action} by ${interaction.user.tag} for employee ${employee.tag}`);

  } catch (error) {
    console.error('Error processing approval decision:', error);

    await interaction.editReply({
      content: '❌ Có lỗi xảy ra khi xử lý quyết định. Vui lòng thử lại sau.',
    });
  }
}

async function handleContinueForm(interaction) {
  const userId = interaction.customId.replace('continue_form_', '');

  // Check if user is authorized
  if (interaction.user.id !== userId) {
    return await interaction.reply({
      content: '❌ Bạn không có quyền thực hiện hành động này.',
      flags: MessageFlags.Ephemeral
    });
  }

  // Check if form data exists
  const storedData = interaction.client.tempFormData?.get(userId);
  if (!storedData) {
    return await interaction.reply({
      content: '❌ Dữ liệu form đã hết hạn. Vui lòng sử dụng lệnh `/form` để bắt đầu lại.',
      flags: MessageFlags.Ephemeral
    });
  }

  // Create second modal for remaining fields
  const modal2 = new ModalBuilder()
    .setCustomId('leave_request_form_part2')
    .setTitle('📝 Form Xin Nghỉ Phép (Bước 2/2)');

  // Leave time input
  const leaveTimeInput = new TextInputBuilder()
    .setCustomId('leave_time')
    .setLabel('Thời gian nghỉ')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(`Chọn: ${config.timeOptions.join(', ')}`)
    .setRequired(true)
    .setMaxLength(20);

  // Reason input
  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Lý do nghỉ')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Mô tả lý do xin nghỉ phép...')
    .setRequired(true)
    .setMaxLength(500);

  // Direct manager input
  const directManagerInput = new TextInputBuilder()
    .setCustomId('direct_manager')
    .setLabel('Quản lý trực tiếp')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('vd: Nguyễn Văn B')
    .setRequired(true)
    .setMaxLength(100);

  // Create action rows
  const firstActionRow = new ActionRowBuilder().addComponents(leaveTimeInput);
  const secondActionRow = new ActionRowBuilder().addComponents(reasonInput);
  const thirdActionRow = new ActionRowBuilder().addComponents(directManagerInput);

  modal2.addComponents(firstActionRow, secondActionRow, thirdActionRow);

  await interaction.showModal(modal2);
}

async function handleCancelForm(interaction) {
  const userId = interaction.customId.replace('cancel_form_', '');

  // Check if user is authorized
  if (interaction.user.id !== userId) {
    return await interaction.reply({
      content: '❌ Bạn không có quyền thực hiện hành động này.',
      flags: MessageFlags.Ephemeral
    });
  }

  // Clean up temporary data
  if (interaction.client.tempFormData) {
    interaction.client.tempFormData.delete(userId);
  }
  if (interaction.client.draftFormData) {
    interaction.client.draftFormData.delete(userId);
  }
  if (interaction.client.draftFormDataPart2) {
    interaction.client.draftFormDataPart2.delete(userId);
  }

  await interaction.reply({
    content: '❌ Form đã được hủy. Sử dụng lệnh `/form` để bắt đầu lại nếu cần.',
    flags: MessageFlags.Ephemeral
  });
}

async function handleRetryForm(interaction) {
  const userId = interaction.customId.replace('retry_form_', '');

  if (interaction.user.id !== userId) {
    return await interaction.reply({
      content: '❌ Bạn không có quyền thực hiện hành động này.',
      flags: MessageFlags.Ephemeral
    });
  }

  const draftData = interaction.client.draftFormData?.get(userId);
  if (!draftData) {
    return await interaction.reply({
      content: '❌ Không tìm thấy dữ liệu trước đó. Vui lòng sử dụng lệnh `/form` để bắt đầu lại.',
      flags: MessageFlags.Ephemeral
    });
  }

  const modal = new ModalBuilder()
    .setCustomId('leave_request_form')
    .setTitle('📝 Form Xin Nghỉ Phép');

  const emailInput = new TextInputBuilder()
    .setCustomId('email')
    .setLabel('Email công ty')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('vd: nguyen.van.a@company.com')
    .setRequired(true)
    .setMaxLength(100);

  if (draftData.email) {
    emailInput.setValue(draftData.email);
  }

  const employeeIdInput = new TextInputBuilder()
    .setCustomId('employee_id')
    .setLabel('Mã nhân viên')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('vd: NV001')
    .setRequired(true)
    .setMaxLength(20);

  if (draftData.employeeId) {
    employeeIdInput.setValue(draftData.employeeId);
  }

  const fullNameInput = new TextInputBuilder()
    .setCustomId('full_name')
    .setLabel('Họ và tên')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('vd: Nguyễn Văn A')
    .setRequired(true)
    .setMaxLength(100);

  if (draftData.fullName) {
    fullNameInput.setValue(draftData.fullName);
  }

  const departmentInput = new TextInputBuilder()
    .setCustomId('department')
    .setLabel('Phòng ban/Công ty')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(`Chọn: ${config.departments.join(', ')}`)
    .setRequired(true)
    .setMaxLength(50);

  if (draftData.department) {
    departmentInput.setValue(draftData.department);
  }

  const leaveDateInput = new TextInputBuilder()
    .setCustomId('leave_date')
    .setLabel('Ngày nghỉ (dd/mm/yyyy)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('vd: 25/12/2024')
    .setRequired(true)
    .setMaxLength(10);

  if (draftData.leaveDate) {
    leaveDateInput.setValue(draftData.leaveDate);
  }

  const firstActionRow = new ActionRowBuilder().addComponents(emailInput);
  const secondActionRow = new ActionRowBuilder().addComponents(employeeIdInput);
  const thirdActionRow = new ActionRowBuilder().addComponents(fullNameInput);
  const fourthActionRow = new ActionRowBuilder().addComponents(departmentInput);
  const fifthActionRow = new ActionRowBuilder().addComponents(leaveDateInput);

  modal.addComponents(
    firstActionRow,
    secondActionRow,
    thirdActionRow,
    fourthActionRow,
    fifthActionRow
  );

  await interaction.showModal(modal);
}

async function handleRetryFormPart2(interaction) {
  const userId = interaction.customId.replace('retry_form_part2_', '');

  console.log('[DEBUG] handleRetryFormPart2:');
  console.log('  customId:', interaction.customId);
  console.log('  extracted userId:', userId);
  console.log('  interaction.user.id:', interaction.user.id);
  console.log('  Match:', interaction.user.id === userId);

  if (interaction.user.id !== userId) {
    return await interaction.reply({
      content: '❌ Bạn không có quyền thực hiện hành động này.',
      flags: MessageFlags.Ephemeral
    });
  }

  const storedData = interaction.client.tempFormData?.get(userId);
  if (!storedData) {
    return await interaction.reply({
      content: '❌ Dữ liệu form đã hết hạn. Vui lòng sử dụng lệnh `/form` để bắt đầu lại.',
      flags: MessageFlags.Ephemeral
    });
  }

  const draftData = interaction.client.draftFormDataPart2?.get(userId);
  if (!draftData) {
    return await interaction.reply({
      content: '❌ Không tìm thấy dữ liệu trước đó. Vui lòng sử dụng lệnh `/form` để bắt đầu lại.',
      flags: MessageFlags.Ephemeral
    });
  }

  const modal2 = new ModalBuilder()
    .setCustomId('leave_request_form_part2')
    .setTitle('📝 Form Xin Nghỉ Phép (Bước 2/2)');

  const leaveTimeInput = new TextInputBuilder()
    .setCustomId('leave_time')
    .setLabel('Thời gian nghỉ')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder(`Chọn: ${config.timeOptions.join(', ')}`)
    .setRequired(true)
    .setMaxLength(20);

  if (draftData.leaveTime) {
    leaveTimeInput.setValue(draftData.leaveTime);
  }

  const reasonInput = new TextInputBuilder()
    .setCustomId('reason')
    .setLabel('Lý do nghỉ')
    .setStyle(TextInputStyle.Paragraph)
    .setPlaceholder('Mô tả lý do xin nghỉ phép...')
    .setRequired(true)
    .setMaxLength(500);

  if (draftData.reason) {
    reasonInput.setValue(draftData.reason);
  }

  const directManagerInput = new TextInputBuilder()
    .setCustomId('direct_manager')
    .setLabel('Quản lý trực tiếp (Điền chính xác tên đầy đủ)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('vd: Nguyễn Văn B')
    .setRequired(true)
    .setMaxLength(100);

  if (draftData.directManager) {
    directManagerInput.setValue(draftData.directManager);
  }

  const firstActionRow = new ActionRowBuilder().addComponents(leaveTimeInput);
  const secondActionRow = new ActionRowBuilder().addComponents(reasonInput);
  const thirdActionRow = new ActionRowBuilder().addComponents(directManagerInput);

  modal2.addComponents(firstActionRow, secondActionRow, thirdActionRow);

  await interaction.showModal(modal2);
}
