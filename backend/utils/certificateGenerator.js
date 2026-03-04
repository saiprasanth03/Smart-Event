const Registration = require('../models/Registration');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCertificate = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const { memberToken } = req.query; // Optional specific team member token
        const registration = await Registration.findById(registrationId).populate('user').populate('event');

        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        if (registration.attendanceStatus === 'Registered') {
            return res.status(400).json({ message: 'Attendance not verified. Cannot generate certificate.' });
        }

        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        const filename = `certificate_${registrationId}.pdf`;

        // Set headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        let participantName = registration.user.name;
        if (memberToken && registration.teamMembers) {
            const member = registration.teamMembers.find(m => m.qrToken === memberToken);
            if (member) participantName = member.name;
        }

        const isAchievement = registration.award && registration.award !== 'None';
        const titleText = isAchievement ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION';

        // Certificate Design
        doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).lineWidth(15).stroke('#1e293b');
        doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100).lineWidth(2).stroke('#6366f1');

        doc.fontSize(40).fillColor('#1e293b').text(titleText, { align: 'center' }, 150);
        doc.fontSize(20).text('This is to certify that', { align: 'center' }, 220);
        doc.fontSize(35).fillColor('#6366f1').text(participantName, { align: 'center' }, 250);

        if (isAchievement) {
            // Replace wordings if necessary "Winners" -> "has secured Winners" etc.
            let awardText = registration.award;
            if (awardText === 'Winners') awardText = 'the 1st Place (Winners) position';
            else if (awardText === '1st Runners') awardText = 'the 2nd Place (1st Runners) position';
            else if (awardText === '2nd Runners') awardText = 'the 3rd Place (2nd Runners) position';

            doc.fontSize(20).fillColor('#1e293b').text(`has secured ${awardText} in the event`, { align: 'center' }, 310);
        } else {
            doc.fontSize(20).fillColor('#1e293b').text(`has successfully participated in the event`, { align: 'center' }, 310);
        }

        doc.fontSize(25).fillColor('#a855f7').text(registration.event.name, { align: 'center' }, 350);
        doc.fontSize(15).fillColor('#1e293b').text(`held on ${new Date(registration.event.date).toLocaleDateString()}`, { align: 'center' }, 400);

        doc.fontSize(14).fillColor('#1e293b');
        doc.text('HOD Signature', 100, 500);
        doc.text('Vice Principal Signature', doc.page.width / 2 - 80, 500);
        doc.text('Principal Signature', doc.page.width - 250, 500);

        // Rendering Signatures
        const renderSignature = (sigData, x, y) => {
            if (sigData && sigData.startsWith('data:image')) {
                try {
                    const base64Data = sigData.split(',')[1];
                    const imgBuffer = Buffer.from(base64Data, 'base64');
                    // Render image slightly above the text
                    doc.image(imgBuffer, x, y - 45, { fit: [120, 40], align: 'center' });
                } catch (e) {
                    console.error('Failed to parse signature image:', e);
                }
            }
        };

        renderSignature(registration.event.hodSignature, 90, 500);
        renderSignature(registration.event.vicePrincipalSignature, doc.page.width / 2 - 90, 500);
        renderSignature(registration.event.principalSignature, doc.page.width - 260, 500);

        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

const generateTeamCertificates = async (req, res) => {
    try {
        const { registrationId } = req.params;
        const registration = await Registration.findById(registrationId).populate('user').populate('event');

        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        if (registration.attendanceStatus === 'Registered') {
            return res.status(400).json({ message: 'Attendance not verified. Cannot generate certificate.' });
        }

        const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
        const safeTeamName = (registration.teamName || 'Team').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${safeTeamName}_certificates.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        doc.pipe(res);

        const isAchievement = registration.award && registration.award !== 'None';
        const titleText = isAchievement ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION';

        // Helper to draw a certificate on the current page
        const drawCertificate = (participantName) => {
            // Certificate Design
            doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80).lineWidth(15).stroke('#1e293b');
            doc.rect(50, 50, doc.page.width - 100, doc.page.height - 100).lineWidth(2).stroke('#6366f1');

            doc.fontSize(40).fillColor('#1e293b').text(titleText, { align: 'center' }, 150);
            doc.fontSize(20).text('This is to certify that', { align: 'center' }, 220);
            doc.fontSize(35).fillColor('#6366f1').text(participantName, { align: 'center' }, 250);

            if (isAchievement) {
                let awardText = registration.award;
                if (awardText === 'Winners') awardText = 'the 1st Place (Winners) position';
                else if (awardText === '1st Runners') awardText = 'the 2nd Place (1st Runners) position';
                else if (awardText === '2nd Runners') awardText = 'the 3rd Place (2nd Runners) position';

                doc.fontSize(20).fillColor('#1e293b').text(`has secured ${awardText} in the event`, { align: 'center' }, 310);
            } else {
                doc.fontSize(20).fillColor('#1e293b').text(`has successfully participated in the event`, { align: 'center' }, 310);
            }

            doc.fontSize(25).fillColor('#a855f7').text(registration.event.name, { align: 'center' }, 350);
            doc.fontSize(15).fillColor('#1e293b').text(`held on ${new Date(registration.event.date).toLocaleDateString()}`, { align: 'center' }, 400);

            doc.fontSize(14).fillColor('#1e293b');
            doc.text('HOD Signature', 100, 500);
            doc.text('Vice Principal Signature', doc.page.width / 2 - 80, 500);
            doc.text('Principal Signature', doc.page.width - 250, 500);

            // Rendering Signatures
            const renderSignature = (sigData, x, y) => {
                if (sigData && sigData.startsWith('data:image')) {
                    try {
                        const base64Data = sigData.split(',')[1];
                        const imgBuffer = Buffer.from(base64Data, 'base64');
                        doc.image(imgBuffer, x, y - 45, { fit: [120, 40], align: 'center' });
                    } catch (e) {
                        console.error('Failed to parse signature image:', e);
                    }
                }
            };

            renderSignature(registration.event.hodSignature, 90, 500);
            renderSignature(registration.event.vicePrincipalSignature, doc.page.width / 2 - 90, 500);
            renderSignature(registration.event.principalSignature, doc.page.width - 260, 500);
        };

        // Draw leader
        drawCertificate(registration.user.name);

        // Draw team members
        if (registration.teamMembers && registration.teamMembers.length > 0) {
            for (let member of registration.teamMembers) {
                doc.addPage();
                drawCertificate(member.name);
            }
        }

        doc.end();
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { generateCertificate, generateTeamCertificates };
