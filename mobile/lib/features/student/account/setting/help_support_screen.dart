import 'package:flutter/material.dart';

class StudentHelpSupportScreen extends StatelessWidget {
  const StudentHelpSupportScreen({super.key});

  static final List<_FaqItem> _faqItems = [
    _FaqItem(
      question: 'How do I update my profile information?',
      answer:
          'Profile updates such as programme, department, or contact details are managed by the institute admin. '
          'Please contact the academic office or email support if any information shown is incorrect.',
    ),
    _FaqItem(
      question: 'I cannot see my course schedule. What should I do?',
      answer:
          'The course integration is currently rolling out in phases. If your schedule is missing, try refreshing the dashboard. '
          'If the issue persists for more than 24 hours, raise a ticket with support.',
    ),
    _FaqItem(
      question: 'How can I report a lost ID card or travel issue?',
      answer:
          'Use the transport help desk link below or email the operations team with your entry number and a brief description of the issue.',
    ),
    _FaqItem(
      question: 'How do I reset my password?',
      answer:
          'Navigate to Settings → Security and choose Reset via email. You will receive a verification code to create a new password.',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Help & Support'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(24.0),
        children: [
          Text(
            'We’re here to help',
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Text(
            'Reach out to us through the channels below or browse frequently asked questions.',
            style: theme.textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          _buildContactCard(context),
          const SizedBox(height: 24),
          Text(
            'Frequently Asked Questions',
            style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ..._faqItems.map((item) => _FaqExpansion(item: item)),
          const SizedBox(height: 24),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Service hours',
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Monday – Friday · 9:00 AM to 6:00 PM\nEmergency transport hotline operates 24/7.',
                    style: theme.textTheme.bodyMedium,
                  ),
                  const SizedBox(height: 16),
                  FilledButton.icon(
                    onPressed: () => _showSnack(context, 'Support ticket portal opening soon.'),
                    icon: const Icon(Icons.launch_outlined),
                    label: const Text('Open support portal'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactCard(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ListTile(
              contentPadding: EdgeInsets.zero,
              leading: const Icon(Icons.support_agent_outlined),
              title: const Text('Support desk'),
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.email_outlined),
              title: const Text('Email'),
              subtitle: const Text('oae@admin.iitd.ac.in'),
              onTap: () => _showSnack(context, 'Launching email composer...'),
            ),
            ListTile(
              leading: const Icon(Icons.call_outlined),
              title: const Text('Office hotline'),
              subtitle: const Text('+91 11 2659 XXXX'),
              onTap: () => _showSnack(context, 'Dialling emergency hotline...'),
            ),
            ListTile(
              leading: const Icon(Icons.forum_outlined),
              title: const Text('Live chat'),
              subtitle: const Text('Chat with a support specialist in the portal.'),
              onTap: () => _showSnack(context, 'Connecting to live chat...'),
            ),
          ],
        ),
      ),
    );
  }

  static void _showSnack(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
  }
}

class _FaqItem {
  const _FaqItem({required this.question, required this.answer});

  final String question;
  final String answer;
}

class _FaqExpansion extends StatelessWidget {
  const _FaqExpansion({required this.item});

  final _FaqItem item;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ExpansionTile(
        title: Text(item.question),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        children: [
          Align(
            alignment: Alignment.centerLeft,
            child: Text(
              item.answer,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

