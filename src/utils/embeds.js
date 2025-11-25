const { EmbedBuilder } = require('discord.js');

class EmbedUtils {
  /**
   * Create embed for leave request form submission confirmation
   */
  static createFormSubmissionEmbed(requestData) {
    return new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Đơn xin nghỉ phép đã được gửi')
      .setDescription('Đơn của bạn đã được gửi đến trưởng phòng để xem xét.')
      .addFields(
        { name: '📧 Email', value: requestData.email, inline: true },
        { name: '🆔 Mã nhân viên', value: requestData.employeeId, inline: true },
        { name: '👤 Họ và tên', value: requestData.fullName, inline: true },
        { name: '🏢 Phòng ban/Công ty', value: requestData.department, inline: true },
        { name: '📅 Ngày nghỉ', value: requestData.leaveDate, inline: true },
        { name: '⏰ Thời gian nghỉ', value: requestData.leaveTime, inline: true },
        { name: '📝 Lý do nghỉ', value: requestData.reason, inline: false },
        { name: '👨‍💼 Quản lý trực tiếp', value: requestData.directManager, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Hệ thống quản lý nghỉ phép' });
  }

  /**
   * Create embed for manager approval request
   */
  static createManagerApprovalEmbed(requestData, employeeUser) {
    return new EmbedBuilder()
      .setColor('#ffaa00')
      .setTitle('📋 Yêu cầu nghỉ phép mới')
      .setDescription(`Nhân viên **${requestData.fullName}** đã gửi đơn xin nghỉ phép cần được duyệt.`)
      .addFields(
        { name: '📧 Email', value: requestData.email, inline: true },
        { name: '🆔 Mã nhân viên', value: requestData.employeeId, inline: true },
        { name: '👤 Họ và tên', value: requestData.fullName, inline: true },
        { name: '🏢 Phòng ban/Công ty', value: requestData.department, inline: true },
        { name: '📅 Ngày nghỉ', value: requestData.leaveDate, inline: true },
        { name: '⏰ Thời gian nghỉ', value: requestData.leaveTime, inline: true },
        { name: '📝 Lý do nghỉ', value: requestData.reason, inline: false },
        { name: '👨‍💼 Quản lý trực tiếp', value: requestData.directManager, inline: false }
      )
      .setThumbnail(employeeUser?.displayAvatarURL() || null)
      .setTimestamp()
      .setFooter({ text: 'Vui lòng chọn Duyệt hoặc Từ chối bên dưới' });
  }

  /**
   * Create embed for HR notification (approved requests)
   */
  static createHRNotificationEmbed(requestData, managerUser) {
    return new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle('✅ Đơn nghỉ phép được duyệt')
      .setDescription(`Đơn nghỉ phép của **${requestData.fullName}** đã được duyệt bởi trưởng phòng.`)
      .addFields(
        { name: '📧 Email', value: requestData.email, inline: true },
        { name: '🆔 Mã nhân viên', value: requestData.employeeId, inline: true },
        { name: '👤 Họ và tên', value: requestData.fullName, inline: true },
        { name: '🏢 Phòng ban/Công ty', value: requestData.department, inline: true },
        { name: '📅 Ngày nghỉ', value: requestData.leaveDate, inline: true },
        { name: '⏰ Thời gian nghỉ', value: requestData.leaveTime, inline: true },
        { name: '📝 Lý do nghỉ', value: requestData.reason, inline: false },
        { name: '👨‍💼 Quản lý trực tiếp', value: requestData.directManager, inline: false },
        { name: '✅ Được duyệt bởi', value: managerUser?.displayName || 'Trưởng phòng', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: 'Dữ liệu đã được cập nhật vào Google Sheets' });
  }

  /**
   * Create embed for approval confirmation to manager
   */
  static createApprovalConfirmationEmbed(requestData, action) {
    const color = action === 'approved' ? '#00ff00' : '#ff0000';
    const title = action === 'approved' ? '✅ Đã duyệt đơn nghỉ phép' : '❌ Đã từ chối đơn nghỉ phép';
    const description = action === 'approved' 
      ? `Bạn đã duyệt đơn nghỉ phép của **${requestData.fullName}**. HR đã được thông báo.`
      : `Bạn đã từ chối đơn nghỉ phép của **${requestData.fullName}**. Nhân viên đã được thông báo.`;

    return new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description)
      .addFields(
        { name: '👤 Nhân viên', value: requestData.fullName, inline: true },
        { name: '🏢 Phòng ban/Công ty', value: requestData.department, inline: true },
        { name: '📅 Ngày nghỉ', value: requestData.leaveDate, inline: true }
      )
      .setTimestamp();
  }

  /**
   * Create embed for employee notification (approved/rejected)
   */
  static createEmployeeNotificationEmbed(requestData, action, managerUser) {
    const color = action === 'approved' ? '#00ff00' : '#ff0000';
    const title = action === 'approved' ? '✅ Đơn nghỉ phép được duyệt' : '❌ Đơn nghỉ phép bị từ chối';
    const description = action === 'approved'
      ? 'Chúc mừng! Đơn xin nghỉ phép của bạn đã được duyệt.'
      : 'Đơn xin nghỉ phép của bạn đã bị từ chối. Vui lòng liên hệ trưởng phòng để biết thêm chi tiết.';

    return new EmbedBuilder()
      .setColor(color)
      .setTitle(title)
      .setDescription(description)
      .addFields(
        { name: '📅 Ngày nghỉ', value: requestData.leaveDate, inline: true },
        { name: '⏰ Thời gian nghỉ', value: requestData.leaveTime, inline: true },
        { name: '📝 Lý do nghỉ', value: requestData.reason, inline: false },
        { name: '👨‍💼 Xử lý bởi', value: managerUser?.displayName || 'Trưởng phòng', inline: false }
      )
      .setTimestamp();
  }

  /**
   * Create error embed
   */
  static createErrorEmbed(title, description) {
    return new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle(`❌ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }

  /**
   * Create success embed
   */
  static createSuccessEmbed(title, description) {
    return new EmbedBuilder()
      .setColor('#00ff00')
      .setTitle(`✅ ${title}`)
      .setDescription(description)
      .setTimestamp();
  }
}

module.exports = EmbedUtils;
