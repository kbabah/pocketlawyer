import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

// GET - Fetch all email templates
export async function GET() {
  try {
    const templatesSnapshot = await adminDb
      .collection('email_templates')
      .orderBy('createdAt', 'desc')
      .get();

    const templates = templatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({
      templates,
      total: templates.length
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new email template
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { name, subject, htmlContent, textContent, category } = body;

    if (!name || !subject || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, htmlContent' },
        { status: 400 }
      );
    }

    const templateData = {
      name,
      subject,
      htmlContent,
      textContent: textContent || '',
      category: category || 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    const docRef = await adminDb.collection('email_templates').add(templateData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      template: { id: docRef.id, ...templateData }
    });
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Failed to create template', details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update an existing template
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, subject, htmlContent, textContent, category, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (htmlContent !== undefined) updateData.htmlContent = htmlContent;
    if (textContent !== undefined) updateData.textContent = textContent;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;

    await adminDb.collection('email_templates').doc(id).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Template updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Failed to update template', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a template
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await adminDb.collection('email_templates').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Failed to delete template', details: error.message },
      { status: 500 }
    );
  }
}
