import { NextResponse } from 'next/server';
import { validateEnvironment } from '@/lib/env-validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log('[HEALTH/ENV] Starting environment validation');
    
    const validation = validateEnvironment();
    
    if (!validation.isValid) {
      console.error('[HEALTH/ENV] Environment validation failed:', validation.errors);
      return NextResponse.json({
        status: 'unhealthy',
        environment: 'invalid',
        errors: validation.errors,
        warnings: validation.warnings,
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
    
    console.log('[HEALTH/ENV] Environment validation passed');
    if (validation.warnings.length > 0) {
      console.warn('[HEALTH/ENV] Environment warnings:', validation.warnings);
    }
    
    return NextResponse.json({
      status: 'healthy',
      environment: 'valid',
      warnings: validation.warnings,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: unknown) {
    console.error('[HEALTH/ENV] Environment check failed:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      environment: 'error',
      error: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Environment check failed',
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
